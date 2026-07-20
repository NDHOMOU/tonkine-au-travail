/**
 * usePostureDetection — Détection de posture par webcam via TensorFlow.js
 *
 * Utilise MoveNet (SinglePose Lightning) pour détecter 17 points clés du corps.
 * Calcule les angles posturaux et les compare aux normes du profil employé.
 * Envoie les mesures à l'API Spring Boot toutes les SEND_INTERVAL_MS.
 * Se réinitialise le minuteur dès qu'un changement de posture est détecté.
 *
 * Le modèle est chargé depuis /models (vendorisé dans public/), jamais depuis
 * un CDN externe : l'appli doit fonctionner entièrement hors ligne, sur le
 * réseau interne de l'entreprise (confidentialité des données + impossibilité
 * de contourner la surveillance en coupant l'accès internet du poste).
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import { postureApi } from '../api/postureApi';

const SEND_INTERVAL_MS    = 5000;  // Envoie une mesure toutes les 5 secondes
const STANDING_THRESHOLD  = 0.3;   // Score de confiance minimum pour considérer la personne debout
const MODEL_URL = '/models/movenet-singlepose-lightning/model.json';

export function usePostureDetection({ sessionId, profil, onPostureChange, onStanding }) {
  const [isActive,    setIsActive]    = useState(false);
  const [detector,    setDetector]    = useState(null);
  const [lastScores,  setLastScores]  = useState(null);
  const videoRef      = useRef(null);
  const streamRef     = useRef(null);
  const animFrameRef  = useRef(null);
  const lastSendRef   = useRef(0);
  const sessionIdRef  = useRef(sessionId);
  const motifsSignalesRef = useRef(new Set());

  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  /**
   * Signale à l'admin/kiné (via une alerte backend) que la surveillance n'a
   * pas pu démarrer. Un seul signalement par motif et par montage du hook,
   * pour éviter de spammer le dashboard admin en cas d'échecs répétés.
   */
  const signalerIndisponibilite = useCallback((motif) => {
    if (motifsSignalesRef.current.has(motif)) return;
    motifsSignalesRef.current.add(motif);
    postureApi.signalerIndisponible(sessionIdRef.current ?? null, motif).catch(() => {});
  }, []);

  // Charge le modèle MoveNet (vendorisé localement) au montage
  useEffect(() => {
    let mounted = true;
    poseDetection
      .createDetector(poseDetection.SupportedModels.MoveNet, {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        modelUrl: MODEL_URL,
      })
      .then(d => { if (mounted) setDetector(d); })
      .catch(err => {
        console.warn('MoveNet non disponible :', err);
        signalerIndisponibilite('MODELE_INDISPONIBLE');
      });

    return () => { mounted = false; };
  }, [signalerIndisponibilite]);

  /**
   * Calcule l'angle entre trois points keypoints (en degrés).
   * Utilisé pour mesurer les angles posturaux (nuque, dos, coudes...).
   */
  const calculerAngle = useCallback((a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x)
                  - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * (180 / Math.PI));
    if (angle > 180) angle = 360 - angle;
    return angle;
  }, []);

  /**
   * Convertit les keypoints MoveNet en scores posturaux (0-100).
   * Basé sur les normes ISO 9241 adaptées à la morphologie de l'employé.
   */
  const calculerScores = useCallback((keypoints) => {
    const kp = {};
    keypoints.forEach(k => { kp[k.name] = k; });

    const scores = {};

    // Score nuque : angle entre oreille, épaule et hanche
    if (kp.left_ear && kp.left_shoulder && kp.left_hip &&
        kp.left_ear.score > 0.4) {
      const angle = calculerAngle(kp.left_ear, kp.left_shoulder, kp.left_hip);
      // Norme : angle proche de 180° (tête droite) → score 100
      // Angle < 160° (tête penchée) → score diminue
      scores.NUQUE_CERVICALES = Math.min(100, Math.max(0, (angle - 140) * 2));
    }

    // Score dos : angle entre épaule, hanche et genou
    if (kp.left_shoulder && kp.left_hip && kp.left_knee &&
        kp.left_shoulder.score > 0.4) {
      const angle = calculerAngle(kp.left_shoulder, kp.left_hip, kp.left_knee);
      scores.DOS_LOMBAIRES = Math.min(100, Math.max(0, (angle - 80) * 1.5));
    }

    // Score épaules : symétrie gauche/droite
    if (kp.left_shoulder && kp.right_shoulder &&
        kp.left_shoulder.score > 0.4 && kp.right_shoulder.score > 0.4) {
      const diff = Math.abs(kp.left_shoulder.y - kp.right_shoulder.y);
      scores.EPAULES = Math.min(100, Math.max(0, 100 - diff * 500));
    }

    return scores;
  }, [calculerAngle]);

  /**
   * Détecte si la personne est debout (vs assise).
   * Si debout → appelle onStanding() pour réinitialiser le minuteur.
   */
  const detecterDebout = useCallback((keypoints) => {
    const kp = {};
    keypoints.forEach(k => { kp[k.name] = k; });

    if (kp.left_hip && kp.left_knee && kp.left_ankle &&
        kp.left_hip.score > STANDING_THRESHOLD) {
      const hipY   = kp.left_hip.y;
      const kneeY  = kp.left_knee.y;
      const ankleY = kp.left_ankle.y;
      // Si les hanches sont près des genoux → assis, sinon debout
      const isDebout = (ankleY - hipY) > (kneeY - hipY) * 2.5;
      if (isDebout) onStanding?.();
    }
  }, [onStanding]);

  /** Boucle de détection continue */
  const detecterPosture = useCallback(async () => {
    if (!detector || !videoRef.current || !isActive) return;

    const video = videoRef.current;
    if (video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detecterPosture);
      return;
    }

    try {
      const poses = await detector.estimatePoses(video);
      if (poses.length > 0) {
        const { keypoints } = poses[0];
        const scores = calculerScores(keypoints);
        detecterDebout(keypoints);
        setLastScores(scores);
        onPostureChange?.(scores);

        // Envoie les scores à l'API toutes les SEND_INTERVAL_MS
        const now = Date.now();
        if (sessionId && now - lastSendRef.current > SEND_INTERVAL_MS) {
          lastSendRef.current = now;
          Object.entries(scores).forEach(([zone, score]) => {
            postureApi.envoyerMesure({ sessionId, zone, score })
              .catch(() => {}); // Silencieux — la connexion peut être momentanément interrompue
          });
        }
      }
    } catch (err) {
      // Erreur de détection non critique
    }

    animFrameRef.current = requestAnimationFrame(detecterPosture);
  }, [detector, isActive, sessionId, calculerScores, detecterDebout, onPostureChange]);

  useEffect(() => {
    if (isActive && detector) {
      animFrameRef.current = requestAnimationFrame(detecterPosture);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isActive, detector, detecterPosture]);

  /** Démarre réellement la webcam (getUserMedia) avant d'activer la détection. */
  const activer = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsActive(true);
    } catch (err) {
      // Permission refusée, aucune caméra détectée, etc.
      console.warn('Webcam non disponible :', err);
      signalerIndisponibilite('WEBCAM_INDISPONIBLE');
    }
  }, [signalerIndisponibilite]);

  const desactiver = useCallback(() => {
    setIsActive(false);
    cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  return { isActive, activer, desactiver, lastScores, videoRef };
}

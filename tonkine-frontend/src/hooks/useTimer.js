/**
 * useTimer — Minuteur de session assise
 *
 * Gère le décompte des 2h assis consécutifs.
 * Se réinitialise via reset() (appelé par la détection webcam ou confirmation pause).
 * Déclenche onAlert() quand le seuil est atteint.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

const TWO_HOURS_SECONDS = 7200;

export function useTimer({ onAlert, autoStart = true, initialSeconds = 0 }) {
  const [seconds,    setSeconds]    = useState(initialSeconds);
  const [isRunning,  setIsRunning]  = useState(autoStart);
  const [alertFired, setAlertFired] = useState(initialSeconds >= TWO_HOURS_SECONDS);
  const intervalRef = useRef(null);

  const start = useCallback(() => setIsRunning(true),  []);
  const stop  = useCallback(() => setIsRunning(false), []);

  // Recale l'affichage sur la vraie durée suivie par le serveur (ex. après
  // le chargement du tableau de bord) — le minuteur local seul ne doit pas
  // prétendre repartir de zéro à chaque rechargement de page.
  const synchroniser = useCallback((valeurServeur) => {
    setSeconds(valeurServeur);
    setAlertFired(valeurServeur >= TWO_HOURS_SECONDS);
  }, []);

  const reset = useCallback(() => {
    setSeconds(0);
    setAlertFired(false);
    setIsRunning(true);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          const next = prev + 1;
          // Déclenche l'alerte une seule fois à 2h
          if (next >= TWO_HOURS_SECONDS && !alertFired) {
            setAlertFired(true);
            onAlert?.();
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, alertFired, onAlert]);

  // Formatage HH:MM:SS
  const formatted = [
    Math.floor(seconds / 3600),
    Math.floor((seconds % 3600) / 60),
    seconds % 60,
  ].map(n => String(n).padStart(2, '0')).join(':');

  const progressPct = Math.min((seconds / TWO_HOURS_SECONDS) * 100, 100);

  return { seconds, formatted, progressPct, isRunning, start, stop, reset, synchroniser };
}

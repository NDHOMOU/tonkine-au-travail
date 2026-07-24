/**
 * ConseilsKine — File de conseils santé (échange employé ↔ kiné en ligne)
 */
import { useState, useEffect, useCallback } from 'react';
import { conseilApi } from '../../api/conseilApi';
import AppLayout      from '../../components/layout/AppLayout';
import toast           from 'react-hot-toast';

export default function ConseilsKine() {
  const [conseils, setConseils] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [reponses, setReponses] = useState({});
  const [envoiId,  setEnvoiId]  = useState(null);

  const charger = useCallback(async () => {
    try {
      const { data } = await conseilApi.getFileKine();
      setConseils(data);
    } catch { toast.error('Impossible de charger la file de conseils.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  const ouvrirConseil = async (conseil) => {
    if (conseil.statut === 'EN_ATTENTE') {
      try { await conseilApi.marquerVu(conseil.id); charger(); } catch {}
    }
  };

  const envoyerReponse = async (conseilId) => {
    const rep = reponses[conseilId];
    if (!rep?.trim()) { toast.error('Rédigez votre réponse.'); return; }
    setEnvoiId(conseilId);
    try {
      await conseilApi.repondre(conseilId, rep);
      toast.success('Réponse envoyée au patient.');
      setReponses(prev => ({ ...prev, [conseilId]: '' }));
      charger();
    } catch { toast.error('Impossible d\'envoyer la réponse.'); }
    finally { setEnvoiId(null); }
  };

  if (loading) return <AppLayout title="Conseils santé"><div className="loading-screen"><i className="fa-solid fa-spinner fa-spin" /> Chargement…</div></AppLayout>;

  return (
    <AppLayout title="Conseils santé">
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {conseils.length === 0 ? (
          <div className="card"><div className="empty-state" style={{ padding:40 }}>
            <i className="fa-solid fa-comment-slash" />
            <p>Aucune demande de conseil en attente.</p>
          </div></div>
        ) : conseils.map(c => (
          <div key={c.id} className="card"
            style={{ borderLeft: c.niveauUrgence === 'URGENT' ? '3px solid var(--bad)' : '3px solid var(--border)' }}
            onClick={() => ouvrirConseil(c)}>
            <div style={{ padding:'16px 20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, gap:8, flexWrap:'wrap' }}>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                  <span style={{ fontWeight:700 }}>{c.nomEmploye}</span>
                  {c.departementEmploye && <span className="badge gray">{c.departementEmploye}</span>}
                  {c.niveauUrgence === 'URGENT' && <span className="pill-urgent"><i className="fa-solid fa-bolt" /> Urgent</span>}
                  {c.zoneConcernee && <span className="badge blue">{c.zoneConcernee.replace('_',' ')}</span>}
                  <span className={`badge ${c.statut === 'EN_ATTENTE' ? 'warn' : c.statut === 'VU' ? 'blue' : 'green'}`}>
                    {c.statut === 'EN_ATTENTE' ? 'En attente' : c.statut === 'VU' ? 'Lu' : 'Répondu'}
                  </span>
                </div>
                <span style={{ fontSize:'.7rem', color:'var(--ink-60)', flexShrink:0 }}>
                  {c.minutesDepuisQuestion < 60 ? `Il y a ${c.minutesDepuisQuestion} min`
                    : new Date(c.dateQuestion).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', hour:'2-digit', minute:'2-digit' })}
                </span>
              </div>

              <div style={{ background:'var(--sand)', borderRadius:8, padding:'10px 14px', marginBottom: c.statut !== 'REPONDU' ? 14 : 0 }}>
                <div style={{ fontSize:'.65rem', fontWeight:700, color:'var(--ink-60)', marginBottom:4, textTransform:'uppercase' }}>Question</div>
                <p style={{ fontSize:'.85rem', lineHeight:1.6 }}>{c.question}</p>
              </div>

              {c.reponse && (
                <div style={{ background:'var(--teal-bg)', borderRadius:8, padding:'10px 14px', marginTop:10 }}>
                  <div style={{ fontSize:'.65rem', fontWeight:700, color:'var(--teal)', marginBottom:4, textTransform:'uppercase' }}>Votre réponse</div>
                  <p style={{ fontSize:'.82rem', lineHeight:1.55 }}>{c.reponse}</p>
                </div>
              )}

              {c.statut !== 'REPONDU' && (
                <div style={{ marginTop:12 }}>
                  <textarea className="form-textarea" rows={3}
                    placeholder="Rédigez votre réponse kinésithérapique…"
                    value={reponses[c.id] || ''}
                    onChange={e => setReponses(prev => ({ ...prev, [c.id]: e.target.value }))}
                    onClick={e => e.stopPropagation()} />
                  <button className="btn btn-teal btn-sm" style={{ marginTop:8 }}
                    disabled={envoiId === c.id}
                    onClick={e => { e.stopPropagation(); envoyerReponse(c.id); }}>
                    {envoiId === c.id
                      ? <><i className="fa-solid fa-spinner fa-spin" /> Envoi…</>
                      : <><i className="fa-solid fa-paper-plane" /> Envoyer la réponse</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}

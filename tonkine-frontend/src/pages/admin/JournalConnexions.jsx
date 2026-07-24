/**
 * JournalConnexions — Historique des connexions des utilisateurs de l'entreprise.
 */
import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api/adminApi';
import AppLayout     from '../../components/layout/AppLayout';
import toast          from 'react-hot-toast';

export default function JournalConnexions() {
  const [journal, setJournal] = useState([]);
  const [loading, setLoading] = useState(true);

  const charger = useCallback(async () => {
    try {
      const { data } = await adminApi.getJournalConnexions();
      setJournal(data);
    } catch { toast.error('Impossible de charger le journal des connexions.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  if (loading) return <AppLayout title="Journal des connexions"><div className="loading-screen"><i className="fa-solid fa-spinner fa-spin" /> Chargement…</div></AppLayout>;

  return (
    <AppLayout title="Journal des connexions">
      <div className="card">
        <div className="card-head" style={{ paddingBottom:0 }}>
          <h3>Historique des connexions</h3>
          <button className="btn btn-outline btn-sm" onClick={charger}>
            <i className="fa-solid fa-rotate" /> Actualiser
          </button>
        </div>
        <div style={{ padding:'8px 0 0' }}>
          {journal.length === 0 ? (
            <div className="empty-state" style={{ padding:30 }}>
              <i className="fa-solid fa-clock-rotate-left" />
              <p>Aucune connexion enregistrée pour l'instant.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Utilisateur</th><th>Rôle</th><th>Adresse IP</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {journal.map((j, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight:600 }}>{j.nomComplet}</td>
                      <td><span className="badge gray">{j.role}</span></td>
                      <td style={{ color:'var(--ink-60)', fontSize:'.78rem' }}>{j.adresseIp || '—'}</td>
                      <td style={{ color:'var(--ink-60)', fontSize:'.78rem' }}>
                        {new Date(j.dateConnexion).toLocaleString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

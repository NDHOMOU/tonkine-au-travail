/**
 * DashboardAdmin — Tableau de bord RH
 * Vue globale de la santé posturale de l'entreprise
 */
import { useState, useEffect, useCallback } from 'react';
import { adminApi }  from '../../api/adminApi';
import AppLayout     from '../../components/layout/AppLayout';
import { telechargerBlob } from '../../utils/telechargerFichier';
import toast         from 'react-hot-toast';

export default function DashboardAdmin() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [envoi,   setEnvoi]   = useState(false);

  // ── Gestion des comptes admin ──
  const [comptesAdmin, setComptesAdmin]     = useState([]);
  const [showFormAdmin, setShowFormAdmin]   = useState(false);
  const [formAdmin, setFormAdmin]           = useState({ prenom:'', nom:'', email:'' });
  const [creationEnCours, setCreationEnCours] = useState(false);
  const [reinitEnCours, setReinitEnCours]   = useState(null); // id en cours de reset
  const [motDePasseRevele, setMotDePasseRevele] = useState(null); // { email, motDePasseTemporaire }

  // ── Paramètres entreprise ──
  const [entreprise, setEntreprise]       = useState(null);
  const [entrepriseModif, setEntrepriseModif] = useState(null);
  const [sauvegardeEnCours, setSauvegardeEnCours] = useState(false);

  // ── Journal des connexions ──
  const [journal, setJournal] = useState([]);

  // ── Journal d'audit ──
  const [journalAudit, setJournalAudit] = useState([]);

  // ── Rapport ──
  const [telechargementEnCours, setTelechargementEnCours] = useState(false);

  const charger = useCallback(async () => {
    try {
      const { data: d } = await adminApi.getDashboard();
      setData(d);
    } catch { toast.error('Impossible de charger le tableau de bord.'); }
    finally { setLoading(false); }
  }, []);

  const chargerComptesAdmin = useCallback(async () => {
    try {
      const { data: comptes } = await adminApi.listerComptesAdmin();
      setComptesAdmin(comptes);
    } catch { toast.error('Impossible de charger les comptes admin.'); }
  }, []);

  const chargerEntreprise = useCallback(async () => {
    try {
      const { data } = await adminApi.getEntreprise();
      setEntreprise(data);
      setEntrepriseModif(data);
    } catch { toast.error('Impossible de charger les paramètres de l\'entreprise.'); }
  }, []);

  const chargerJournal = useCallback(async () => {
    try {
      const { data } = await adminApi.getJournalConnexions();
      setJournal(data);
    } catch { toast.error('Impossible de charger le journal des connexions.'); }
  }, []);

  const chargerJournalAudit = useCallback(async () => {
    try {
      const { data } = await adminApi.getJournalAudit();
      setJournalAudit(data);
    } catch { toast.error('Impossible de charger le journal d\'audit.'); }
  }, []);

  useEffect(() => {
    charger(); chargerComptesAdmin(); chargerEntreprise(); chargerJournal(); chargerJournalAudit();
  }, [charger, chargerComptesAdmin, chargerEntreprise, chargerJournal, chargerJournalAudit]);

  const sauvegarderEntreprise = async (e) => {
    e.preventDefault();
    setSauvegardeEnCours(true);
    try {
      const { data } = await adminApi.mettreAJourEntreprise(entrepriseModif);
      setEntreprise(data);
      setEntrepriseModif(data);
      chargerJournalAudit();
      toast.success('Paramètres de l\'entreprise mis à jour.');
    } catch {
      toast.error('Impossible d\'enregistrer les paramètres.');
    } finally {
      setSauvegardeEnCours(false);
    }
  };

  const telechargerRapport = async () => {
    setTelechargementEnCours(true);
    try {
      const { data: blob } = await adminApi.telechargerRapportHebdomadaire();
      telechargerBlob(blob, `rapport-hebdomadaire-${new Date().toISOString().slice(0,10)}.csv`);
    } catch {
      toast.error('Impossible de générer le rapport.');
    } finally {
      setTelechargementEnCours(false);
    }
  };

  const creerAdmin = async (e) => {
    e.preventDefault();
    if (!formAdmin.prenom.trim() || !formAdmin.nom.trim() || !formAdmin.email.trim()) {
      toast.error('Remplissez tous les champs.'); return;
    }
    setCreationEnCours(true);
    try {
      const { data: r } = await adminApi.creerCompteAdmin(formAdmin.prenom, formAdmin.nom, formAdmin.email);
      setMotDePasseRevele(r);
      setFormAdmin({ prenom:'', nom:'', email:'' });
      setShowFormAdmin(false);
      chargerComptesAdmin();
      chargerJournalAudit();
    } catch (err) {
      toast.error(err.response?.data?.erreur || 'Impossible de créer ce compte.');
    } finally {
      setCreationEnCours(false);
    }
  };

  const reinitialiserMotDePasse = async (compte) => {
    setReinitEnCours(compte.id);
    try {
      const { data: r } = await adminApi.reinitialiserMotDePasse(compte.id);
      setMotDePasseRevele(r);
      chargerComptesAdmin();
      chargerJournalAudit();
    } catch {
      toast.error('Impossible de réinitialiser ce mot de passe.');
    } finally {
      setReinitEnCours(null);
    }
  };

  const envoyerAlerte = async () => {
    if (!message.trim()) { toast.error('Rédigez un message.'); return; }
    setEnvoi(true);
    try {
      const { data: r } = await adminApi.envoyerAlerteCollective(message);
      toast.success(`Message envoyé à ${r.envoyees} employé(s) actifs.`);
      setMessage('');
      chargerJournalAudit();
    } catch { toast.error('Impossible d\'envoyer l\'alerte.'); }
    finally { setEnvoi(false); }
  };

  if (loading) return <AppLayout title="Tableau de bord RH"><div className="loading-screen"><i className="fa-solid fa-spinner fa-spin" /> Chargement…</div></AppLayout>;

  const d = data || {};

  return (
    <AppLayout title="Tableau de bord RH">

      {/* ── KPIs ── */}
      <div className="kpi-grid" style={{ gridTemplateColumns:'repeat(auto-fit, minmax(160px,1fr))' }}>
        <div className="kpi-card blue">
          <div className="kpi-label">Employés inscrits</div>
          <div className="kpi-value">{d.totalEmployesInscrits ?? '—'}</div>
          <div className="kpi-sub">Total dans l'entreprise</div>
        </div>
        <div className="kpi-card ok">
          <div className="kpi-label">Actifs aujourd'hui</div>
          <div className="kpi-value">{d.totalEmployesActifsAujourdhui ?? '—'}</div>
          <div className="kpi-sub">App lancée</div>
        </div>
        <div className="kpi-card" style={{ borderLeft: `3px solid ${(d.scoreMoyenEquipe ?? 0) >= 70 ? '#0B9B8A' : '#C47A00'}` }}>
          <div className="kpi-label">Score moyen équipe</div>
          <div className="kpi-value" style={{ color: (d.scoreMoyenEquipe ?? 0) >= 70 ? '#0B9B8A' : '#C47A00' }}>
            {d.scoreMoyenEquipe ?? '—'}%
          </div>
          <div className="kpi-sub">Posture globale</div>
        </div>
        <div className="kpi-card warn">
          <div className="kpi-label">Alertes non traitées</div>
          <div className="kpi-value" style={{ color:'var(--warn)' }}>{d.alertesActivesNonTraitees ?? '—'}</div>
          <div className="kpi-sub">Nécessitent attention</div>
        </div>
        <div className="kpi-card danger">
          <div className="kpi-label">Employés à risque</div>
          <div className="kpi-value" style={{ color:'var(--bad)' }}>{d.employesARisqueEleve ?? '—'}</div>
          <div className="kpi-sub">Score postural &lt; 60%</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap:20, marginBottom:20 }}>

        {/* ── Stats par département ── */}
        <div className="card">
          <div className="card-head"><h3>Statistiques par département</h3></div>
          <div style={{ padding:'8px 0 0' }}>
            {(d.statsDepartements || []).length === 0 ? (
              <div className="empty-state" style={{ padding:30 }}>
                <i className="fa-solid fa-building" />
                <p>Aucune session active aujourd'hui</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Département</th>
                      <th>Employés actifs</th>
                      <th>Score moyen</th>
                      <th>Niveau</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(d.statsDepartements || []).map(dept => (
                      <tr key={dept.departement}>
                        <td style={{ fontWeight:600 }}>{dept.departement}</td>
                        <td>{dept.nombreEmployes}</td>
                        <td style={{ fontWeight:700, color: dept.scoreMoyen >= 70 ? '#0B9B8A' : '#C47A00' }}>
                          {Math.round(dept.scoreMoyen)}%
                        </td>
                        <td>
                          <span className={`badge ${dept.scoreMoyen >= 70 ? 'green' : dept.scoreMoyen >= 50 ? 'warn' : 'danger'}`}>
                            {dept.scoreMoyen >= 70 ? 'Bon' : dept.scoreMoyen >= 50 ? 'À surveiller' : 'Risque élevé'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Alerte collective ── */}
        <div className="card">
          <div className="card-head"><h3>Alerte collective</h3></div>
          <div className="card-body" style={{ paddingTop:14 }}>
            <p style={{ fontSize:'.8rem', color:'var(--ink-60)', marginBottom:14, lineHeight:1.6 }}>
              Envoyez un message instantané à tous les employés actifs — rappel de pause, annonce, consigne de sécurité.
            </p>
            <textarea className="form-textarea" rows={4}
              placeholder="Ex : Il est 15h, prenez une pause de 10 minutes et faites vos exercices cervicaux."
              value={message} onChange={e => setMessage(e.target.value)} />
            <button className="btn btn-primary" style={{ marginTop:12, width:'100%' }}
              disabled={!message.trim() || envoi} onClick={envoyerAlerte}>
              {envoi
                ? <><i className="fa-solid fa-spinner fa-spin" /> Envoi en cours…</>
                : <><i className="fa-solid fa-bullhorn" /> Envoyer à tous ({d.totalEmployesActifsAujourdhui ?? 0} actifs)</>}
            </button>
          </div>
        </div>
      </div>

      {/* ── Suivi des employés ── */}
      <div className="card">
        <div className="card-head" style={{ paddingBottom:0 }}>
          <h3>Suivi des employés actifs</h3>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-outline btn-sm" disabled={telechargementEnCours} onClick={telechargerRapport}>
              <i className="fa-solid fa-file-arrow-down" /> {telechargementEnCours ? 'Génération…' : 'Rapport hebdomadaire (CSV)'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={charger}>
              <i className="fa-solid fa-rotate" /> Actualiser
            </button>
          </div>
        </div>
        <div style={{ padding:'8px 0 0' }}>
          {(d.employes || []).length === 0 ? (
            <div className="empty-state" style={{ padding:30 }}>
              <i className="fa-solid fa-users" />
              <p>Aucun employé actif pour le moment.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Employé</th>
                    <th>Département</th>
                    <th>Poste</th>
                    <th>Score posture</th>
                    <th>Temps assis</th>
                    <th>Pauses</th>
                    <th>Session</th>
                  </tr>
                </thead>
                <tbody>
                  {(d.employes || []).map(emp => {
                    const heures = Math.floor((emp.dureeAssisCourantSecondes || 0) / 3600);
                    const mins   = Math.floor(((emp.dureeAssisCourantSecondes || 0) % 3600) / 60);
                    const pauseOk = (emp.pausesEffectueesAujourdhui || 0) >= (emp.pausesObjectifAujourdhui || 4);
                    return (
                      <tr key={emp.userId}>
                        <td style={{ fontWeight:600 }}>{emp.nomComplet}</td>
                        <td>{emp.departement}</td>
                        <td style={{ color:'var(--ink-60)', fontSize:'.78rem' }}>{emp.poste}</td>
                        <td>
                          {emp.scorePostureGlobal != null ? (
                            <span style={{ fontWeight:700, color: emp.scorePostureGlobal >= 70 ? '#0B9B8A' : emp.scorePostureGlobal >= 50 ? '#C47A00' : '#C0392B' }}>
                              {Math.round(emp.scorePostureGlobal)}%
                            </span>
                          ) : <span style={{ color:'var(--ink-30)' }}>—</span>}
                        </td>
                        <td style={{ fontWeight: heures >= 2 ? 700 : 400, color: heures >= 2 ? 'var(--bad)' : 'var(--ink)' }}>
                          {`${heures}h${String(mins).padStart(2,'0')}`}
                        </td>
                        <td>
                          <span className={`badge ${pauseOk ? 'green' : 'warn'}`}>
                            {emp.pausesEffectueesAujourdhui}/{emp.pausesObjectifAujourdhui}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${emp.sessionActive ? 'green' : 'gray'}`}>
                            {emp.sessionActive ? '● En ligne' : '○ Hors ligne'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Alertes récentes ── */}
      {(d.alertesRecentes || []).length > 0 && (
        <div className="card" style={{ marginTop:20 }}>
          <div className="card-head"><h3>Alertes récentes non traitées</h3></div>
          <div style={{ padding:'8px 0 0' }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Employé</th><th>Département</th><th>Type</th><th>Score</th><th>Durée assise</th><th>Heure</th></tr>
                </thead>
                <tbody>
                  {(d.alertesRecentes || []).map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight:600 }}>{a.nomEmploye}</td>
                      <td>{a.departement}</td>
                      <td><span className="badge warn">{a.type?.replace('_',' ')}</span></td>
                      <td>{a.scorePosture != null ? `${Math.round(a.scorePosture)}%` : '—'}</td>
                      <td>{a.dureeAssiSecondes ? `${Math.floor(a.dureeAssiSecondes/3600)}h${String(Math.floor((a.dureeAssiSecondes%3600)/60)).padStart(2,'0')}` : '—'}</td>
                      <td style={{ color:'var(--ink-60)', fontSize:'.78rem' }}>
                        {new Date(a.dateEnvoi).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Paramètres de l'entreprise ── */}
      <div className="card" style={{ marginTop:20 }}>
        <div className="card-head"><h3>Paramètres de l'entreprise</h3></div>
        {entrepriseModif && (
          <form onSubmit={sauvegarderEntreprise} style={{ padding:'0 20px 20px', display:'grid',
            gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:14 }}>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Nom de l'entreprise</div>
              <input className="form-input" value={entrepriseModif.nom || ''}
                onChange={e => setEntrepriseModif(v => ({ ...v, nom: e.target.value }))} required />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Nom affiché de l'application</div>
              <input className="form-input" value={entrepriseModif.nomApp || ''}
                onChange={e => setEntrepriseModif(v => ({ ...v, nomApp: e.target.value }))} />
            </label>
            <label style={{ gridColumn:'1 / -1' }}>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Slogan</div>
              <input className="form-input" value={entrepriseModif.slogan || ''}
                onChange={e => setEntrepriseModif(v => ({ ...v, slogan: e.target.value }))} />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>URL du logo</div>
              <input className="form-input" value={entrepriseModif.logoUrl || ''}
                onChange={e => setEntrepriseModif(v => ({ ...v, logoUrl: e.target.value }))} placeholder="https://…" />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Secteur d'activité</div>
              <input className="form-input" value={entrepriseModif.secteurActivite || ''}
                onChange={e => setEntrepriseModif(v => ({ ...v, secteurActivite: e.target.value }))} />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Couleur primaire</div>
              <input className="form-input" type="color" style={{ height:40, padding:4 }}
                value={entrepriseModif.couleurPrimaire || '#1353A4'}
                onChange={e => setEntrepriseModif(v => ({ ...v, couleurPrimaire: e.target.value }))} />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Couleur secondaire</div>
              <input className="form-input" type="color" style={{ height:40, padding:4 }}
                value={entrepriseModif.couleurSecondaire || '#0B9B8A'}
                onChange={e => setEntrepriseModif(v => ({ ...v, couleurSecondaire: e.target.value }))} />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Ville</div>
              <input className="form-input" value={entrepriseModif.ville || ''}
                onChange={e => setEntrepriseModif(v => ({ ...v, ville: e.target.value }))} />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Pays</div>
              <input className="form-input" value={entrepriseModif.pays || ''}
                onChange={e => setEntrepriseModif(v => ({ ...v, pays: e.target.value }))} />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Téléphone</div>
              <input className="form-input" value={entrepriseModif.telephone || ''}
                onChange={e => setEntrepriseModif(v => ({ ...v, telephone: e.target.value }))} />
            </label>
            <label>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Email de contact</div>
              <input className="form-input" type="email" value={entrepriseModif.emailContact || ''}
                onChange={e => setEntrepriseModif(v => ({ ...v, emailContact: e.target.value }))} />
            </label>
            <div style={{ gridColumn:'1 / -1' }}>
              <button className="btn btn-primary" disabled={sauvegardeEnCours} type="submit">
                {sauvegardeEnCours ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Journal des connexions ── */}
      <div className="card" style={{ marginTop:20 }}>
        <div className="card-head"><h3>Journal des connexions</h3></div>
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

      {/* ── Journal d'audit ── */}
      <div className="card" style={{ marginTop:20 }}>
        <div className="card-head"><h3>Journal d'audit</h3></div>
        <div style={{ padding:'8px 0 0' }}>
          {journalAudit.length === 0 ? (
            <div className="empty-state" style={{ padding:30 }}>
              <i className="fa-solid fa-list-check" />
              <p>Aucune action administrative enregistrée pour l'instant.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Qui</th><th>Action</th><th>Détails</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {journalAudit.map((a, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight:600 }}>{a.acteur}</td>
                      <td><span className="badge gray">{a.action.replaceAll('_',' ')}</span></td>
                      <td style={{ color:'var(--ink-60)', fontSize:'.78rem' }}>{a.details}</td>
                      <td style={{ color:'var(--ink-60)', fontSize:'.78rem' }}>
                        {new Date(a.dateAction).toLocaleString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Gestion des comptes admin ── */}
      <div className="card" style={{ marginTop:20 }}>
        <div className="card-head" style={{ paddingBottom:0 }}>
          <h3>Gestion des comptes admin</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setShowFormAdmin(v => !v)}>
            <i className="fa-solid fa-user-plus" /> Nouvel admin
          </button>
        </div>

        {showFormAdmin && (
          <form onSubmit={creerAdmin} style={{ padding:'16px 20px', borderBottom:'1px solid var(--ink-10, #eee)', display:'flex', gap:10, flexWrap:'wrap', alignItems:'flex-end' }}>
            <label style={{ flex:'1 1 140px' }}>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Prénom</div>
              <input className="form-input" value={formAdmin.prenom}
                onChange={e => setFormAdmin(f => ({ ...f, prenom: e.target.value }))} required />
            </label>
            <label style={{ flex:'1 1 140px' }}>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Nom</div>
              <input className="form-input" value={formAdmin.nom}
                onChange={e => setFormAdmin(f => ({ ...f, nom: e.target.value }))} required />
            </label>
            <label style={{ flex:'2 1 220px' }}>
              <div style={{ fontSize:'.78rem', marginBottom:4 }}>Email professionnel</div>
              <input className="form-input" type="email" value={formAdmin.email}
                onChange={e => setFormAdmin(f => ({ ...f, email: e.target.value }))} required />
            </label>
            <button className="btn btn-primary" disabled={creationEnCours} type="submit">
              {creationEnCours ? 'Création…' : 'Créer le compte'}
            </button>
          </form>
        )}

        <div style={{ padding:'8px 0 0' }}>
          {comptesAdmin.length === 0 ? (
            <div className="empty-state" style={{ padding:30 }}>
              <i className="fa-solid fa-user-shield" />
              <p>Aucun autre compte admin pour l'instant.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Nom</th><th>Email</th><th>Statut</th><th></th></tr>
                </thead>
                <tbody>
                  {comptesAdmin.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight:600 }}>{c.prenom} {c.nom}</td>
                      <td style={{ color:'var(--ink-60)', fontSize:'.78rem' }}>{c.email}</td>
                      <td>
                        <span className={`badge ${c.motDePasseTemporaire ? 'warn' : 'green'}`}>
                          {c.motDePasseTemporaire ? 'Mot de passe temporaire' : 'Actif'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-sm"
                          disabled={reinitEnCours === c.id}
                          onClick={() => reinitialiserMotDePasse(c)}>
                          {reinitEnCours === c.id ? 'Réinitialisation…' : 'Réinitialiser le mot de passe'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Mot de passe temporaire révélé (une seule fois) ── */}
      {motDePasseRevele && (
        <div style={{ position:'fixed', inset:0, background:'rgba(20,20,30,.55)', display:'flex',
          alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
          <div className="card" style={{ maxWidth:440, width:'100%' }}>
            <div className="card-head"><h3>Mot de passe temporaire créé</h3></div>
            <div style={{ padding:'0 20px 20px' }}>
              <p style={{ fontSize:'.85rem', color:'var(--ink-60)', marginBottom:14 }}>
                Communiquez-le vous-même à <strong>{motDePasseRevele.email}</strong> — il ne sera
                plus jamais affiché après fermeture de cette fenêtre. La personne devra le
                changer dès sa première connexion.
              </p>
              <div style={{ background:'var(--sand)', borderRadius:8, padding:'12px 14px',
                fontFamily:'monospace', fontSize:'1rem', fontWeight:700, letterSpacing:'.5px',
                userSelect:'all', marginBottom:16, wordBreak:'break-all' }}>
                {motDePasseRevele.motDePasseTemporaire}
              </div>
              <button className="btn btn-primary" style={{ width:'100%' }}
                onClick={() => setMotDePasseRevele(null)}>
                J'ai noté le mot de passe, fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </AppLayout>
  );
}

/**
 * RecommandationsProduits — Catalogue d'orthèses et équipements ergonomiques
 * recommandés par le kiné. Simple consultation avec lien vers le vendeur —
 * aucun achat n'est géré dans l'application.
 */
import { useState, useEffect } from 'react';
import { produitApi } from '../../api/produitApi';
import AppLayout       from '../../components/layout/AppLayout';
import toast            from 'react-hot-toast';

const ZONE_LABEL = {
  DOS_LOMBAIRES: 'Dos / Lombaires', NUQUE_CERVICALES: 'Nuque / Cervicales',
  EPAULES: 'Épaules', POIGNETS_AVANT_BRAS: 'Poignets / Avant-bras',
  HANCHES_BASSIN: 'Hanches / Bassin', YEUX_VISION: 'Yeux / Vision',
};

export default function RecommandationsProduits() {
  const [produits, setProduits] = useState([]);
  const [loading,   setLoading] = useState(true);

  useEffect(() => {
    produitApi.getProduits()
      .then(r => setProduits(r.data))
      .catch(() => toast.error('Impossible de charger les recommandations.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLayout title="Recommandations"><div className="loading-screen"><i className="fa-solid fa-spinner fa-spin" /> Chargement…</div></AppLayout>;

  return (
    <AppLayout title="Recommandations">
      <div className="page-hero">
        <div className="ph-text">
          <div className="ph-eyebrow">Sélection du kiné</div>
          <h1>Orthèses & <em>équipements</em> recommandés</h1>
          <p>Une sélection choisie par votre kinésithérapeute pour compléter vos exercices. L'achat se fait directement chez le vendeur externe.</p>
        </div>
      </div>

      {produits.length === 0 ? (
        <div className="card"><div className="empty-state" style={{ padding:40 }}>
          <i className="fa-solid fa-briefcase-medical" />
          <p>Votre kinésithérapeute n'a pas encore ajouté de recommandation.</p>
        </div></div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px,1fr))', gap:16 }}>
          {produits.map(p => (
            <div key={p.id} className="card" style={{ overflow:'hidden' }}>
              {p.urlImage && (
                <img src={p.urlImage} alt={p.titre}
                  style={{ width:'100%', height:140, objectFit:'cover' }} />
              )}
              <div style={{ padding:16 }}>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
                  {p.categorie && <span className="badge blue">{p.categorie}</span>}
                  {p.zone && <span className="badge gray">{ZONE_LABEL[p.zone] || p.zone}</span>}
                </div>
                <h3 style={{ fontSize:'.95rem', fontWeight:700, marginBottom:6 }}>{p.titre}</h3>
                {p.description && (
                  <p style={{ fontSize:'.8rem', color:'var(--ink-60)', lineHeight:1.5, marginBottom:10 }}>{p.description}</p>
                )}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
                  {p.prixIndicatif && <span style={{ fontSize:'.82rem', fontWeight:700 }}>{p.prixIndicatif}</span>}
                  {p.urlExterne && (
                    <a href={p.urlExterne} target="_blank" rel="noopener noreferrer"
                      className="btn btn-outline btn-sm">
                      Voir chez le vendeur <i className="fa-solid fa-arrow-up-right-from-square" style={{ marginLeft:4 }} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

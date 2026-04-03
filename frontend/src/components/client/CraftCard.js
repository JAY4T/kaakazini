import { Link } from 'react-router-dom';
import { useCraftsmanStatus } from '../../hooks/useCraftsmanStatus';

const avi    = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'C')}&background=1a1a1a&color=FFD700&size=80&bold=true`;
const imgUrl = (p, base) => {
  if (!p) return null;
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  return `${base}${p.startsWith('/') ? '' : '/'}${p}`;
};

function Stars({ r }) {
  return (
    <span className="craft-stars">
      {[1,2,3,4,5].map(i => (
        <i key={i} className={i <= Math.round(Number(r)||0) ? 'fas fa-star' : 'far fa-star'} />
      ))}
    </span>
  );
}

export default function CraftCard({ c, onHire, onNotifyMe, notifiedIds, mediaBase }) {
  // isBusy comes directly from the hook — driven by live WebSocket
  const { isBusy } = useCraftsmanStatus(c.id);
  const isNotified = notifiedIds.has(c.id);

  const cName  = c?.full_name || c?.name || 'Craftsman';
  const rating = Number(c.average_rating) || 0;
  const ph     = `https://placehold.co/400x140/0d0d0d/FFD700?text=${encodeURIComponent(c.primary_service || '')}`;

  // slug only — never fall back to id
  const profileHref = c.slug ? `/craftsman/${c.slug}` : null;

  const cover = (() => {
    if (!c) return null;
    if (Array.isArray(c.gallery_images) && c.gallery_images.length)
      return imgUrl(
        c.gallery_images[0].image_url || c.gallery_images[0].url || c.gallery_images[0].image,
        mediaBase
      );
    return imgUrl(
      c.services?.[0]?.image_url || c.services?.[0]?.image || c.service_image || null,
      mediaBase
    );
  })();

  const avatar = imgUrl(
    c?.profile_url || c?.profile || c?.profile_image || c?.avatar || null,
    mediaBase
  );

  return (
    <div className="craft-card">
      <div className="craft-cover">
        <img
          src={cover || ph}
          alt={c.primary_service}
          onError={e => { e.target.src = ph; }}
        />
        <span className="trade-pill">{c.primary_service}</span>

        {/* Availability pill — driven by live WebSocket */}
        {!isBusy ? (
          <span className="avail-pill">
            <span className="avail-dot" />Available
          </span>
        ) : (
          <span className="avail-pill-busy">
            <span className="avail-dot" />On a job
          </span>
        )}
      </div>

      <div className="craft-body">
        <div className="craft-row">
          <img
            src={avatar || avi(cName)}
            alt={cName}
            className="craft-av"
            onError={e => { e.target.src = avi(cName); }}
          />
          <div style={{ minWidth: 0 }}>
            {/* Name links to slug profile if available */}
            {profileHref ? (
              <Link
                to={profileHref}
                className="craft-name"
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                {cName}
              </Link>
            ) : (
              <p className="craft-name" style={{ opacity: 0.6 }}>{cName}</p>
            )}
            {c.location && (
              <p className="craft-loc">
                <i className="fas fa-map-marker-alt" style={{ marginRight: 4 }} />
                {c.location}
              </p>
            )}
          </div>
        </div>

        {rating > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Stars r={rating} />
            <span className="craft-rtg">{rating.toFixed(1)}</span>
          </div>
        )}

        {c.description && (
          <p className="craft-desc">
            {c.description.length > 88 ? c.description.slice(0, 88) + '…' : c.description}
          </p>
        )}

        {/* Live status bar */}
        <div className={`avail-status-bar ${isBusy ? 'busy' : 'online'}`}>
          <span>{isBusy ? '🟡 Currently on a job' : '🟢 Available for new jobs'}</span>
          <span style={{ opacity: 0.65, fontSize: '.62rem' }}>Live</span>
        </div>

        {/* Action button */}
        {!isBusy ? (
          <button className="hire-btn" onClick={() => onHire(c)}>
            <i className="fas fa-paper-plane" />
            Request {cName.split(' ')[0]}
          </button>
        ) : isNotified ? (
          <div className="notify-sent">
            <i className="fas fa-bell" />
            You'll be emailed when {cName.split(' ')[0]} is free
          </div>
        ) : (
          <button className="notify-btn" onClick={() => onNotifyMe(c)}>
            <i className="fas fa-bell" />
            Notify me when free
          </button>
        )}
      </div>
    </div>
  );
}

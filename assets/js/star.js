function openSTAR() {
  const modal = document.getElementById('modal');
  document.querySelector('.modal-title').textContent = 'Rédiger une réponse STAR';
  document.getElementById('modal-body').innerHTML = `
    <p style="margin-bottom:20px; color:#64748b;">Structure ta réponse pour l'entretien:</p>
    <div style="margin-bottom:16px;">
      <label style="display:block; margin-bottom:8px; font-weight:600;">Titre</label>
      <input type="text" id="star-title" placeholder="Ex: Ajout admin non prévu" style="width:100%; padding:12px; border:2px solid #e2e8f0; border-radius:12px;" />
    </div>
    <div style="margin-bottom:16px;">
      <label style="display:block; margin-bottom:8px; font-weight:600;">Situation</label>
      <textarea id="star-s" rows="3" placeholder="Contexte, impact, systèmes..." style="width:100%; padding:12px; border:2px solid #e2e8f0; border-radius:12px;"></textarea>
    </div>
    <div style="margin-bottom:16px;">
      <label style="display:block; margin-bottom:8px; font-weight:600;">Tâche</label>
      <textarea id="star-t" rows="2" placeholder="Rôle, objectif..." style="width:100%; padding:12px; border:2px solid #e2e8f0; border-radius:12px;"></textarea>
    </div>
    <div style="margin-bottom:16px;">
      <label style="display:block; margin-bottom:8px; font-weight:600;">Action</label>
      <textarea id="star-a" rows="4" placeholder="Étapes, outils, SPL, artefacts..." style="width:100%; padding:12px; border:2px solid #e2e8f0; border-radius:12px;"></textarea>
    </div>
    <div>
      <label style="display:block; margin-bottom:8px; font-weight:600;">Résultat</label>
      <textarea id="star-r" rows="3" placeholder="Impact, métriques, améliorations..." style="width:100%; padding:12px; border:2px solid #e2e8f0; border-radius:12px;"></textarea>
    </div>
  `;
  const footer = modal.querySelector('.modal-footer');
  footer.innerHTML = `
    <button class="btn btn-secondary" onclick="closeModal()">Fermer</button>
    <button class="btn btn-primary" onclick="saveSTAR()"><i class="fas fa-save"></i> Sauvegarder</button>
  `;
  modal.style.display = 'flex';
}

function saveSTAR() {
  const data = {
    title: document.getElementById('star-title').value,
    s: document.getElementById('star-s').value,
    t: document.getElementById('star-t').value,
    a: document.getElementById('star-a').value,
    r: document.getElementById('star-r').value,
    date: new Date().toISOString()
  };
  const saved = JSON.parse(localStorage.getItem('star-notes') || '[]');
  saved.unshift(data);
  localStorage.setItem('star-notes', JSON.stringify(saved));
  alert('✅ Note STAR sauvegardée avec succès!');
  try { renderSTARNotes(); } catch (e) {}
  closeModal();
}

function renderSTARNotes() {
  const container = document.getElementById('star-notes-list');
  if (!container) return;
  const notes = JSON.parse(localStorage.getItem('star-notes') || '[]');
  if (!notes.length) {
    container.innerHTML = '<p style="color:#64748b;">Aucune note STAR pour le moment. Crée ta première note pour t\'entraîner aux entretiens.</p>';
    return;
  }
  const html = notes.map((n, idx) => {
    const date = new Date(n.date).toLocaleString();
    return `
      <div class="scenario-card">
        <div class="scenario-title">${n.title || 'Sans titre'}</div>
        <div class="scenario-meta">
          <span class="badge badge-info">${date}</span>
        </div>
        <div class="card-footer">
          <button class="btn btn-secondary btn-sm" onclick="openSTARView(${idx})"><i class="fas fa-eye"></i> Voir</button>
          <button class="btn btn-secondary btn-sm" onclick="deleteSTAR(${idx})"><i class="fas fa-trash"></i> Supprimer</button>
        </div>
      </div>
    `;
  }).join('');
  container.innerHTML = html;
}

function openSTARView(index) {
  const notes = JSON.parse(localStorage.getItem('star-notes') || '[]');
  const n = notes[index];
  if (!n) return;
  const modal = document.getElementById('modal');
  document.querySelector('.modal-title').textContent = n.title || 'Réponse STAR';
  document.getElementById('modal-body').innerHTML = `
    <div style="display:grid; gap:12px;">
      <div><strong>Situation:</strong><br>${(n.s || '').replace(/\n/g,'<br>')}</div>
      <div><strong>Tâche:</strong><br>${(n.t || '').replace(/\n/g,'<br>')}</div>
      <div><strong>Action:</strong><br>${(n.a || '').replace(/\n/g,'<br>')}</div>
      <div><strong>Résultat:</strong><br>${(n.r || '').replace(/\n/g,'<br>')}</div>
    </div>
  `;
  const footer = modal.querySelector('.modal-footer');
  footer.innerHTML = `
    <button class="btn btn-secondary" onclick="closeModal()">Fermer</button>
  `;
  modal.style.display = 'flex';
}

function deleteSTAR(index) {
  if (!confirm('Supprimer cette note STAR ?')) return;
  const notes = JSON.parse(localStorage.getItem('star-notes') || '[]');
  notes.splice(index, 1);
  localStorage.setItem('star-notes', JSON.stringify(notes));
  renderSTARNotes();
}

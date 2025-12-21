// Application State
const state = {
    segments: [],
    currentSegment: {
        id: 1,
        nom_segment: 'segment_1',
        distance_cm: 100,
        type_segment: 'ligne_continue',
        ligne: 'noire', // Obligatoire
        frein: 'frein_sec' // Obligatoire
    },
    viewMode: 'list', // 'list' or 'json'
    nextId: 2
};

// DOM Elements
const elements = {
    // Primary fields
    segmentId: document.getElementById('segment-id'),
    segmentName: document.getElementById('segment-name'),
    segmentDistance: document.getElementById('segment-distance'),
    segmentType: document.getElementById('segment-type'),
    lineColor: document.getElementById('line-color'),
    brakeType: document.getElementById('brake-type'),
    
    // Speed
    speedUnchangedBtn: document.getElementById('speed-unchanged'),
    speedModifyBtn: document.getElementById('speed-modify'),
    speedParams: document.getElementById('speed-params'),
    speedMax: document.getElementById('speed-max'),
    speedBase: document.getElementById('speed-base'),
    
    // Driving mode
    drivingMode: document.getElementById('driving-mode'),
    customDrivingMode: document.getElementById('custom-driving-mode'),
    customDrivingInput: document.getElementById('custom-driving-input'),
    
    // Interrupted traits
    enableTraits: document.getElementById('enable-traits'),
    traitsContainer: document.getElementById('traits-container'),
    traitsList: document.getElementById('traits-list'),
    addTraitBtn: document.getElementById('add-trait'),
    
    // End condition
    endCondition: document.getElementById('end-condition'),
    conditionParams: document.getElementById('condition-params'),
    
    // Buttons
    addSegmentBtn: document.getElementById('add-segment'),
    segmentCount: document.getElementById('segment-count'),
    segmentListView: document.getElementById('segment-list-view'),
    jsonPreviewView: document.getElementById('json-preview-view'),
    toggleViewBtn: document.getElementById('toggle-view'),
    viewModeText: document.getElementById('view-mode-text'),
    exportJsonBtn: document.getElementById('export-json'),
    clearAllBtn: document.getElementById('clear-all'),
    jsonOutput: document.getElementById('json-output'),
    copyJsonBtn: document.getElementById('copy-json'),
    emptyState: document.getElementById('empty-state')
};

// Initialize the application
function initApp() {
    setupEventListeners();
    updateSegmentCount();
    updateConditionParams();
    renderSegments();
    
    // Set default values for required fields
    elements.lineColor.value = state.currentSegment.ligne;
    elements.brakeType.value = state.currentSegment.frein;
}

// Setup all event listeners
function setupEventListeners() {
    // Speed mode toggle
    elements.speedUnchangedBtn.addEventListener('click', () => {
        setSpeedMode('unchanged');
    });
    elements.speedModifyBtn.addEventListener('click', () => {
        setSpeedMode('modify');
    });

    // Driving mode change
    elements.drivingMode.addEventListener('change', () => {
        if (elements.drivingMode.value === 'custom') {
            elements.customDrivingMode.classList.remove('hidden');
        } else {
            elements.customDrivingMode.classList.add('hidden');
        }
    });

    // Interrupted traits toggle
    elements.enableTraits.addEventListener('change', () => {
        if (elements.enableTraits.checked) {
            elements.traitsContainer.classList.remove('hidden');
        } else {
            elements.traitsContainer.classList.add('hidden');
        }
    });

    // Add trait button
    elements.addTraitBtn.addEventListener('click', addTrait);

    // End condition change
    elements.endCondition.addEventListener('change', updateConditionParams);

    // Add segment button
    elements.addSegmentBtn.addEventListener('click', addSegment);

    // Toggle view mode
    elements.toggleViewBtn.addEventListener('click', toggleViewMode);

    // Export JSON
    elements.exportJsonBtn.addEventListener('click', exportJSON);

    // Clear all segments
    elements.clearAllBtn.addEventListener('click', clearAllSegments);

    // Copy JSON to clipboard
    elements.copyJsonBtn.addEventListener('click', copyJSONToClipboard);

    // Input changes to update current segment
    elements.segmentId.addEventListener('change', updateCurrentSegment);
    elements.segmentName.addEventListener('input', updateCurrentSegment);
    elements.segmentDistance.addEventListener('change', updateCurrentSegment);
    elements.segmentType.addEventListener('change', updateCurrentSegment);
    elements.lineColor.addEventListener('change', updateCurrentSegment);
    elements.brakeType.addEventListener('change', updateCurrentSegment);
}

// Set speed mode
function setSpeedMode(mode) {
    if (mode === 'unchanged') {
        elements.speedUnchangedBtn.classList.remove('bg-gray-700', 'text-gray-300', 'hover:bg-gray-600');
        elements.speedUnchangedBtn.classList.add('bg-gradient-to-r', 'from-green-600', 'to-green-700', 'text-white');
        elements.speedModifyBtn.classList.remove('bg-gradient-to-r', 'from-green-600', 'to-green-700', 'text-white');
        elements.speedModifyBtn.classList.add('bg-gray-700', 'text-gray-300', 'hover:bg-gray-600');
        elements.speedParams.classList.add('hidden');
    } else {
        elements.speedModifyBtn.classList.remove('bg-gray-700', 'text-gray-300', 'hover:bg-gray-600');
        elements.speedModifyBtn.classList.add('bg-gradient-to-r', 'from-green-600', 'to-green-700', 'text-white');
        elements.speedUnchangedBtn.classList.remove('bg-gradient-to-r', 'from-green-600', 'to-green-700', 'text-white');
        elements.speedUnchangedBtn.classList.add('bg-gray-700', 'text-gray-300');
        elements.speedParams.classList.remove('hidden');
    }
}

// Add a new trait input
function addTrait() {
    const traitCount = elements.traitsList.querySelectorAll('.trait-item').length + 1;
    const traitHtml = `
        <div class="trait-item flex gap-2 mb-2">
            <input type="number" class="trait-input flex-1" placeholder="Trait ${traitCount}">
            <button class="remove-trait">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = traitHtml;
    const newTrait = tempDiv.firstChild;
    
    elements.traitsList.appendChild(newTrait);
    
    // Add event listener to remove button
    newTrait.querySelector('.remove-trait').addEventListener('click', function() {
        newTrait.remove();
    });
}

// Update condition parameters based on selected condition
function updateConditionParams() {
    const condition = elements.endCondition.value;
    let html = '';
    
    switch(condition) {
        case 'distance':
            html = `
                <div class="bg-gray-700/50 p-4 rounded-lg">
                    <label class="block text-sm text-gray-300 mb-2">Distance (cm)</label>
                    <input type="number" id="condition-distance" placeholder="Ex: 150" 
                           class="form-input">
                </div>
            `;
            break;
        case 'capteurs':
            html = `
                <div class="bg-gray-700/50 p-4 rounded-lg">
                    <label class="block text-sm text-gray-300 mb-2">Nombre de Capteurs</label>
                    <input type="number" id="condition-capteurs" placeholder="Ex: 3" 
                           class="form-input">
                    <p class="text-xs text-gray-400 mt-2">Nombre de capteurs activés pour terminer</p>
                </div>
            `;
            break;
        case 'angle':
            html = `
                <div class="bg-gray-700/50 p-4 rounded-lg">
                    <label class="block text-sm text-gray-300 mb-2">Angle (degrés)</label>
                    <input type="number" id="condition-angle" placeholder="Ex: 90 (droite) ou -90 (gauche)" 
                           class="form-input">
                    <p class="text-xs text-gray-400 mt-2">Positif = droite, Négatif = gauche</p>
                </div>
            `;
            break;
        case 'temps':
            html = `
                <div class="bg-gray-700/50 p-4 rounded-lg">
                    <label class="block text-sm text-gray-300 mb-2">Temps (secondes)</label>
                    <input type="number" id="condition-temps" placeholder="Ex: 5.5" 
                           class="form-input">
                </div>
            `;
            break;
        case 'custom':
            html = `
                <div class="bg-gray-700/50 p-4 rounded-lg">
                    <label class="block text-sm text-gray-300 mb-2">Condition Personnalisée</label>
                    <textarea id="condition-custom" rows="3" placeholder="Écrivez votre propre condition" 
                              class="form-input"></textarea>
                </div>
            `;
            break;
        default:
            html = '';
    }
    
    elements.conditionParams.innerHTML = html;
}

// Update current segment from form inputs
function updateCurrentSegment() {
    state.currentSegment = {
        id: parseInt(elements.segmentId.value) || 1,
        nom_segment: elements.segmentName.value,
        distance_cm: parseInt(elements.segmentDistance.value) || 100,
        type_segment: elements.segmentType.value,
        ligne: elements.lineColor.value,
        frein: elements.brakeType.value
    };
}

// Validate required fields
function validateForm() {
    let isValid = true;
    
    // Check line color
    if (!elements.lineColor.value) {
        showNotification('Veuillez sélectionner une couleur de ligne', 'error');
        elements.lineColor.classList.add('border-red-500');
        isValid = false;
    } else {
        elements.lineColor.classList.remove('border-red-500');
    }
    
    // Check brake type
    if (!elements.brakeType.value) {
        showNotification('Veuillez sélectionner un type de frein', 'error');
        elements.brakeType.classList.add('border-red-500');
        isValid = false;
    } else {
        elements.brakeType.classList.remove('border-red-500');
    }
    
    return isValid;
}

// Add a new segment
function addSegment() {
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Create the segment object
    const segment = {
        id: state.currentSegment.id,
        nom_segment: state.currentSegment.nom_segment,
        distance_cm: state.currentSegment.distance_cm,
        type_segment: state.currentSegment.type_segment,
        ligne: state.currentSegment.ligne,
        frein: state.currentSegment.frein
    };
    
    // Add speed if modified
    if (elements.speedModifyBtn.classList.contains('bg-gradient-to-r')) {
        const vitesse = {};
        if (elements.speedMax.value) {
            vitesse.vitesse_max = parseFloat(elements.speedMax.value);
        }
        if (elements.speedBase.value) {
            vitesse.vitesse_base = parseFloat(elements.speedBase.value);
        }
        if (Object.keys(vitesse).length > 0) {
            segment.vitesse = vitesse;
        }
    }
    
    // Add driving mode
    if (elements.drivingMode.value !== 'pid_ligne') {
        if (elements.drivingMode.value === 'custom' && elements.customDrivingInput.value) {
            segment.mode_conduite = elements.customDrivingInput.value;
        } else if (elements.drivingMode.value !== 'custom') {
            segment.mode_conduite = elements.drivingMode.value;
        }
    }
    
    // Add interrupted traits if enabled
    if (elements.enableTraits.checked) {
        const traits = [];
        document.querySelectorAll('.trait-input').forEach(input => {
            if (input.value) {
                traits.push(parseFloat(input.value));
            }
        });
        if (traits.length > 0) {
            segment.traits_interrompus = traits;
        }
    }
    
    // Add end condition (default is "aucune")
    const conditionType = elements.endCondition.value;
    if (conditionType !== 'aucune') {
        let condition = { type: conditionType };
        
        switch(conditionType) {
            case 'distance':
                const distanceInput = document.getElementById('condition-distance');
                if (distanceInput && distanceInput.value) {
                    condition.valeur = parseFloat(distanceInput.value);
                    segment.condition_fin = condition;
                }
                break;
            case 'capteurs':
                const capteursInput = document.getElementById('condition-capteurs');
                if (capteursInput && capteursInput.value) {
                    condition.nb_capteurs = parseInt(capteursInput.value);
                    segment.condition_fin = condition;
                }
                break;
            case 'angle':
                const angleInput = document.getElementById('condition-angle');
                if (angleInput && angleInput.value) {
                    const angleValue = parseFloat(angleInput.value);
                    condition.valeur = angleValue;
                    condition.description = angleValue > 0 ? 'droite' : 'gauche';
                    segment.condition_fin = condition;
                }
                break;
            case 'temps':
                const tempsInput = document.getElementById('condition-temps');
                if (tempsInput && tempsInput.value) {
                    condition.valeur_secondes = parseFloat(tempsInput.value);
                    segment.condition_fin = condition;
                }
                break;
            case 'custom':
                const customInput = document.getElementById('condition-custom');
                if (customInput && customInput.value) {
                    condition.condition = customInput.value;
                    segment.condition_fin = condition;
                }
                break;
        }
    }
    
    // Add to segments array
    state.segments.push(segment);
    
    // Update UI
    renderSegments();
    updateSegmentCount();
    
    // Increment ID for next segment
    state.nextId++;
    elements.segmentId.value = state.nextId;
    elements.segmentName.value = `segment_${state.nextId}`;
    
    // Reset form (keep required fields)
    elements.segmentDistance.value = 100;
    elements.speedMax.value = '';
    elements.speedBase.value = '';
    elements.drivingMode.value = 'pid_ligne';
    elements.customDrivingMode.classList.add('hidden');
    elements.customDrivingInput.value = '';
    elements.enableTraits.checked = false;
    elements.traitsContainer.classList.add('hidden');
    elements.endCondition.value = 'aucune';
    updateConditionParams();
    
    // Show success message
    showNotification(`Segment "${segment.nom_segment}" ajouté avec succès!`, 'success');
}

// Render segments in the list view
function renderSegments() {
    if (state.segments.length === 0) {
        elements.emptyState.classList.remove('hidden');
        elements.segmentListView.innerHTML = '';
        elements.segmentListView.appendChild(elements.emptyState);
        return;
    }
    
    elements.emptyState.classList.add('hidden');
    
    let html = '';
    state.segments.forEach((segment, index) => {
        // Determine badge color based on segment type
        let typeBadgeClass = 'badge-purple';
        if (segment.type_segment.includes('cercle')) {
            typeBadgeClass = 'badge-blue';
        } else if (segment.type_segment === 'virage') {
            typeBadgeClass = 'badge-yellow';
        } else if (segment.type_segment === 'sinus') {
            typeBadgeClass = 'badge-pink';
        }
        
        // Determine line color badge
        const lineBadgeClass = segment.ligne === 'noire' ? 'badge-gray' : 'badge-white border border-gray-600';
        const lineText = segment.ligne === 'noire' ? 'Ligne Noire' : 'Ligne Blanche';
        
        // Determine brake badge
        let brakeBadgeClass = 'badge-red';
        let brakeText = '';
        if (segment.frein === 'frein_sec') {
            brakeText = 'Frein Sec';
        } else if (segment.frein === 'frein_progressif') {
            brakeText = 'Frein Progressif';
            brakeBadgeClass = 'badge-yellow';
        } else {
            brakeText = 'Sans Frein';
            brakeBadgeClass = 'badge-gray';
        }
        
        html += `
            <div class="segment-card">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-bold text-white mb-1">${segment.nom_segment}</h3>
                        <div class="flex flex-wrap gap-2">
                            <span class="badge-gray segment-badge">ID: ${segment.id}</span>
                            <span class="badge-blue segment-badge">${segment.distance_cm} cm</span>
                            <span class="${typeBadgeClass} segment-badge">${segment.type_segment.replace('_', ' ')}</span>
                            <span class="${lineBadgeClass} segment-badge">${lineText}</span>
                            <span class="${brakeBadgeClass} segment-badge">${brakeText}</span>
                        </div>
                    </div>
                    <button class="delete-segment text-red-400 hover:text-red-300 transition" data-index="${index}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${segment.vitesse ? `
                        <div class="flex items-center">
                            <i class="fas fa-bolt text-green-400 mr-2"></i>
                            <span class="text-sm text-gray-300">Vitesse: 
                                ${segment.vitesse.vitesse_max ? `Max: ${segment.vitesse.vitesse_max}` : ''}
                                ${segment.vitesse.vitesse_base ? `, Base: ${segment.vitesse.vitesse_base}` : ''}
                            </span>
                        </div>
                    ` : ''}
                    
                    ${segment.mode_conduite ? `
                        <div class="flex items-center">
                            <i class="fas fa-car text-pink-400 mr-2"></i>
                            <span class="text-sm text-gray-300">${segment.mode_conduite}</span>
                        </div>
                    ` : ''}
                    
                    ${segment.traits_interrompus ? `
                        <div class="flex items-center">
                            <i class="fas fa-grip-lines text-yellow-400 mr-2"></i>
                            <span class="text-sm text-gray-300">Traits: ${segment.traits_interrompus.join(', ')} cm</span>
                        </div>
                    ` : ''}
                    
                    ${segment.condition_fin ? `
                        <div class="flex items-center">
                            <i class="fas fa-flag-checkered text-red-400 mr-2"></i>
                            <span class="text-sm text-gray-300">
                                Fin: ${segment.condition_fin.type}
                                ${segment.condition_fin.valeur ? `: ${segment.condition_fin.valeur}` : ''}
                                ${segment.condition_fin.nb_capteurs ? `: ${segment.condition_fin.nb_capteurs} capteurs` : ''}
                            </span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    elements.segmentListView.innerHTML = html;
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-segment').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deleteSegment(index);
        });
    });
    
    // Update JSON preview if in JSON view
    if (state.viewMode === 'json') {
        updateJSONPreview();
    }
}

// Delete a segment
function deleteSegment(index) {
    if (confirm(`Voulez-vous vraiment supprimer le segment "${state.segments[index].nom_segment}" ?`)) {
        state.segments.splice(index, 1);
        renderSegments();
        updateSegmentCount();
        showNotification('Segment supprimé', 'warning');
    }
}

// Update segment count display
function updateSegmentCount() {
    const count = state.segments.length;
    elements.segmentCount.textContent = `${count} segment${count !== 1 ? 's' : ''} créé${count !== 1 ? 's' : ''}`;
}

// Toggle between list and JSON view
function toggleViewMode() {
    if (state.viewMode === 'list') {
        state.viewMode = 'json';
        elements.segmentListView.classList.add('hidden');
        elements.jsonPreviewView.classList.remove('hidden');
        elements.viewModeText.textContent = 'Vue Liste';
        elements.toggleViewBtn.innerHTML = '<i class="fas fa-list mr-2"></i>Vue Liste';
        updateJSONPreview();
    } else {
        state.viewMode = 'list';
        elements.segmentListView.classList.remove('hidden');
        elements.jsonPreviewView.classList.add('hidden');
        elements.viewModeText.textContent = 'Vue JSON';
        elements.toggleViewBtn.innerHTML = '<i class="fas fa-eye mr-2"></i>Vue JSON';
    }
}

// Update JSON preview
function updateJSONPreview() {
    const jsonData = {
        sequence_segments: state.segments,
        metadata: {
            nombre_segments: state.segments.length,
            date_creation: new Date().toISOString(),
            version: "1.0",
            description: "Séquence de segments générée avec Segment Modeler"
        }
    };
    
    elements.jsonOutput.textContent = JSON.stringify(jsonData, null, 2);
}

// Export JSON to file
function exportJSON() {
    if (state.segments.length === 0) {
        showNotification('Aucun segment à exporter', 'error');
        return;
    }
    
    const jsonData = {
        sequence_segments: state.segments,
        metadata: {
            nombre_segments: state.segments.length,
            date_creation: new Date().toISOString(),
            version: "1.0",
            description: "Séquence de segments générée avec Segment Modeler"
        }
    };
    
    const dataStr = JSON.stringify(jsonData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `segments_${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Fichier JSON exporté avec succès!', 'success');
}

// Copy JSON to clipboard
function copyJSONToClipboard() {
    if (state.segments.length === 0) {
        showNotification('Aucun segment à copier', 'error');
        return;
    }
    
    const jsonData = {
        sequence_segments: state.segments,
        metadata: {
            nombre_segments: state.segments.length,
            date_creation: new Date().toISOString(),
            version: "1.0"
        }
    };
    
    const jsonString = JSON.stringify(jsonData, null, 2);
    
    navigator.clipboard.writeText(jsonString).then(() => {
        showNotification('JSON copié dans le presse-papier!', 'success');
    }).catch(err => {
        showNotification('Erreur lors de la copie: ' + err, 'error');
    });
}

// Clear all segments
function clearAllSegments() {
    if (state.segments.length === 0) {
        showNotification('Aucun segment à effacer', 'info');
        return;
    }
    
    if (confirm(`Voulez-vous vraiment effacer tous les segments (${state.segments.length}) ?`)) {
        state.segments = [];
        state.nextId = 1;
        elements.segmentId.value = 1;
        elements.segmentName.value = 'segment_1';
        renderSegments();
        updateSegmentCount();
        showNotification('Tous les segments ont été effacés', 'warning');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Determine icon and color
    let icon = 'info-circle';
    let gradient = 'from-blue-600 to-blue-700';
    
    if (type === 'success') {
        icon = 'check-circle';
        gradient = 'from-green-600 to-green-700';
    } else if (type === 'error') {
        icon = 'exclamation-circle';
        gradient = 'from-red-600 to-red-700';
    } else if (type === 'warning') {
        icon = 'exclamation-triangle';
        gradient = 'from-yellow-600 to-yellow-700';
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification bg-gradient-to-r ${gradient}`;
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${icon} mr-3"></i>
            <span class="font-medium">${message}</span>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', initApp);
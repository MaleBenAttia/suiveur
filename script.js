// Application State
const state = {
    segments: [],
    currentSegment: {
        id: 1,
        nom_segment: 'segment_1',
        distance_cm: 100,
        type_segment: 'ligne_continue',
        ligne: 'noire',
        frein: 'frein_sec'
    },
    viewMode: 'list',
    nextId: 2,
    editingIndex: null,
    segmentTypes: {
        cercle: 'cercle',
        zigzag: 'zigzag'
    }
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
    brakeDistance: document.getElementById('brake-distance'),
    
    // Form elements
    formIcon: document.getElementById('form-icon'),
    formTitle: document.getElementById('form-title'),
    
    // ZigZag parameters
    zigzagParams: document.getElementById('zigzag-params'),
    zigzagCount: document.getElementById('zigzag-count'),
    zigzagAngles: document.getElementById('zigzag-angles'),
    zigzagDistances: document.getElementById('zigzag-distances'),
    zigzagTimes: document.getElementById('zigzag-times'),
    
    // Circle parameters
    circleParams: document.getElementById('circle-params'),
    circleRadius: document.getElementById('circle-radius'),
    circleTurns: document.getElementById('circle-turns'),
    customTurnsLabel: document.getElementById('custom-turns-label'),
    customCircleTurns: document.getElementById('custom-circle-turns'),
    calculatedDistance: document.getElementById('calculated-distance'),
    
    // Speed
    speedUnchangedBtn: document.getElementById('speed-unchanged'),
    speedModifyBtn: document.getElementById('speed-modify'),
    speedParams: document.getElementById('speed-params'),
    speedMax: document.getElementById('speed-max'),
    speedBase: document.getElementById('speed-base'),
    
    // Driving mode - NOUVELLE VERSION
    functionCount: document.getElementById('function-count'),
    functionsContainer: document.getElementById('functions-container'),
    
    // Interrupted traits
    enableTraits: document.getElementById('enable-traits'),
    traitsContainer: document.getElementById('traits-container'),
    traitsList: document.getElementById('traits-list'),
    addTraitBtn: document.getElementById('add-trait'),
    
    // End condition
    endCondition: document.getElementById('end-condition'),
    conditionParams: document.getElementById('condition-params'),
    
    // Action buttons
    addSegmentBtn: document.getElementById('add-segment'),
    updateSegmentBtn: document.getElementById('update-segment'),
    cancelEditBtn: document.getElementById('cancel-edit'),
    
    // Preview elements
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
    updateFunctions();
    renderSegments();
    
    // Set default values for required fields
    elements.lineColor.value = state.currentSegment.ligne;
    elements.brakeType.value = state.currentSegment.frein;
    
    // Update current segment
    updateCurrentSegment();
    
    // Setup segment type change listener
    elements.segmentType.addEventListener('change', handleSegmentTypeChange);
    
    // Setup circle parameters listeners
    elements.circleRadius.addEventListener('input', calculateCircleDistance);
    elements.circleTurns.addEventListener('change', handleCircleTurnsChange);
    elements.customCircleTurns.addEventListener('input', calculateCircleDistance);
    
    // Setup function count change listener
    elements.functionCount.addEventListener('change', updateFunctions);
    
    // Setup trait removal listeners for initial traits
    setupTraitRemovalListeners();
    
    // Initial calculation for circle distance
    calculateCircleDistance();
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

    // Update segment button
    elements.updateSegmentBtn.addEventListener('click', updateSegment);

    // Cancel edit button
    elements.cancelEditBtn.addEventListener('click', cancelEdit);

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
    elements.brakeDistance.addEventListener('change', updateCurrentSegment);
    
    // ZigZag parameters
    elements.zigzagCount.addEventListener('change', validateZigZagParams);
    elements.zigzagAngles.addEventListener('input', validateZigZagParams);
    elements.zigzagDistances.addEventListener('input', validateZigZagParams);
    elements.zigzagTimes.addEventListener('input', validateZigZagParams);
}

// CORRECTION: Setup trait removal listeners
function setupTraitRemovalListeners() {
    document.querySelectorAll('.remove-trait-btn').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.trait-row').remove();
        });
    });
}

// Handle segment type change
function handleSegmentTypeChange() {
    const type = elements.segmentType.value;
    
    // Hide all specialized panels
    elements.zigzagParams.classList.add('hidden');
    elements.circleParams.classList.add('hidden');
    
    // Show appropriate panel
    if (type === 'zigzag') {
        elements.zigzagParams.classList.remove('hidden');
        validateZigZagParams();
    } else if (type === 'cercle') {
        elements.circleParams.classList.remove('hidden');
        calculateCircleDistance();
    }
    
    updateCurrentSegment();
}

// Update functions based on selected count
function updateFunctions() {
    const count = parseInt(elements.functionCount.value) || 3;
    elements.functionsContainer.innerHTML = '';
    
    for (let i = 1; i <= count; i++) {
        const functionRow = document.createElement('div');
        functionRow.className = 'function-row';
        functionRow.innerHTML = `
            <span class="function-label">Fonction ${i}:</span>
            <div class="select-container" style="flex: 1;">
                <select class="function-select select-input" data-index="${i}">
                    <option value="pid_ligne">PID Ligne</option>
                    <option value="encodeur">Encodeur</option>
                    <option value="gyro">Gyro</option>
                    <option value="libre">Libre</option>
                </select>
                <i class="fas fa-chevron-down select-arrow"></i>
            </div>
            <input type="text" class="function-custom-input text-input hidden" 
                   placeholder="Écrivez votre fonction" data-index="${i}" 
                   style="flex: 1;">
        `;
        
        elements.functionsContainer.appendChild(functionRow);
        
        // Add event listener to function select
        const select = functionRow.querySelector('.function-select');
        const customInput = functionRow.querySelector('.function-custom-input');
        
        select.addEventListener('change', function() {
            if (this.value === 'libre') {
                customInput.classList.remove('hidden');
            } else {
                customInput.classList.add('hidden');
            }
        });
    }
}

// Handle circle turns change
function handleCircleTurnsChange() {
    const turns = elements.circleTurns.value;
    
    if (turns === 'custom') {
        elements.customTurnsLabel.classList.remove('hidden');
        elements.customCircleTurns.classList.remove('hidden');
        elements.customCircleTurns.focus();
    } else {
        elements.customTurnsLabel.classList.add('hidden');
        elements.customCircleTurns.classList.add('hidden');
    }
    
    calculateCircleDistance();
}

// Calculate circle distance
function calculateCircleDistance() {
    const type = elements.segmentType.value;
    const radius = parseFloat(elements.circleRadius.value) || 5;
    let turns = 1;
    
    if (elements.circleTurns.value === 'custom') {
        turns = parseFloat(elements.customCircleTurns.value) || 1;
    } else {
        turns = parseFloat(elements.circleTurns.value) || 1;
    }
    
    // Calculate circumference: 2 * π * rayon
    const circumference = 2 * Math.PI * radius;
    
    // Calculate distance based on type
    let distance = circumference * turns;
    
    // Update distance field and display
    elements.segmentDistance.value = distance.toFixed(2);
    elements.calculatedDistance.textContent = `${distance.toFixed(2)} cm`;
    
    updateCurrentSegment();
}

// Validate ZigZag parameters
function validateZigZagParams() {
    const count = parseInt(elements.zigzagCount.value) || 3;
    
    // Get arrays from comma-separated values
    const angles = elements.zigzagAngles.value.split(',').map(a => a.trim());
    const distances = elements.zigzagDistances.value.split(',').map(d => d.trim());
    const times = elements.zigzagTimes.value.split(',').map(t => t.trim());
    
    // Validate lengths
    if (angles.length < count) {
        showNotification(`Veuillez entrer ${count} angles séparés par des virgules`, 'warning');
        return false;
    }
    
    if (distances.length < count) {
        showNotification(`Veuillez entrer ${count} distances séparées par des virgules`, 'warning');
        return false;
    }
    
    // Calculate total distance for ZigZag
    const totalDistance = distances.reduce((sum, dist) => sum + (parseFloat(dist) || 0), 0);
    elements.segmentDistance.value = totalDistance.toFixed(2);
    
    updateCurrentSegment();
    return true;
}

// Set speed mode
function setSpeedMode(mode) {
    if (mode === 'unchanged') {
        elements.speedUnchangedBtn.classList.add('active');
        elements.speedModifyBtn.classList.remove('active');
        elements.speedParams.classList.add('hidden');
    } else {
        elements.speedModifyBtn.classList.add('active');
        elements.speedUnchangedBtn.classList.remove('active');
        elements.speedParams.classList.remove('hidden');
    }
}

// CORRECTION: Add a new trait input (fonction corrigée)
function addTrait() {
    const traitCount = elements.traitsList.querySelectorAll('.trait-row').length + 1;
    const traitRow = document.createElement('div');
    traitRow.className = 'trait-row';
    traitRow.innerHTML = `
        <input type="number" class="trait-input" placeholder="Trait ${traitCount}">
        <button class="remove-trait-btn">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    elements.traitsList.appendChild(traitRow);
    
    // Add event listener to remove button
    traitRow.querySelector('.remove-trait-btn').addEventListener('click', function() {
        traitRow.remove();
    });
}

// Update condition parameters based on selected condition
function updateConditionParams() {
    const condition = elements.endCondition.value;
    let html = '';
    
    switch(condition) {
        case 'distance':
            html = `
                <div class="info-card">
                    <label>Distance (cm)</label>
                    <input type="number" id="condition-distance" placeholder="Ex: 150" class="text-input mt-2">
                </div>
            `;
            break;
        case 'capteurs':
            html = `
                <div class="info-card">
                    <label>Nombre de Capteurs</label>
                    <input type="number" id="condition-capteurs" placeholder="Ex: 3" class="text-input mt-2">
                    <p class="info-hint">Nombre de capteurs activés pour terminer</p>
                </div>
            `;
            break;
        case 'angle':
            html = `
                <div class="info-card">
                    <label>Angle (degrés)</label>
                    <input type="number" id="condition-angle" placeholder="Ex: 90 (droite) ou -90 (gauche)" class="text-input mt-2">
                    <p class="info-hint">Positif = droite, Négatif = gauche</p>
                </div>
            `;
            break;
        case 'temps':
            html = `
                <div class="info-card">
                    <label>Temps (secondes)</label>
                    <input type="number" id="condition-temps" placeholder="Ex: 5.5" class="text-input mt-2">
                </div>
            `;
            break;
        case 'custom':
            html = `
                <div class="info-card">
                    <label>Condition Personnalisée</label>
                    <textarea id="condition-custom" rows="3" placeholder="Écrivez votre propre condition" class="text-input mt-2"></textarea>
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
        distance_cm: parseFloat(elements.segmentDistance.value) || 100,
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
        elements.lineColor.classList.add('error');
        isValid = false;
    } else {
        elements.lineColor.classList.remove('error');
    }
    
    // Check brake type
    if (!elements.brakeType.value) {
        showNotification('Veuillez sélectionner un type de frein', 'error');
        elements.brakeType.classList.add('error');
        isValid = false;
    } else {
        elements.brakeType.classList.remove('error');
    }
    
    // Validate ZigZag parameters if type is zigzag
    if (elements.segmentType.value === 'zigzag') {
        isValid = validateZigZagParams() && isValid;
    }
    
    return isValid;
}

// Load segment data into form for editing
function loadSegmentForEdit(index) {
    const segment = state.segments[index];
    
    // Set basic fields
    elements.segmentId.value = segment.id;
    elements.segmentName.value = segment.nom_segment;
    elements.segmentDistance.value = segment.distance_cm;
    elements.segmentType.value = segment.type_segment;
    elements.lineColor.value = segment.ligne;
    elements.brakeType.value = segment.frein;
    
    // Set brake distance if exists
    if (segment.distance_freinage) {
        elements.brakeDistance.value = segment.distance_freinage;
    }
    
    // Handle segment type specific fields
    handleSegmentTypeChange();
    
    // Load ZigZag parameters if applicable
    if (segment.type_segment === 'zigzag' && segment.zigzag_params) {
        elements.zigzagCount.value = segment.zigzag_params.nb_zigzag || 3;
        elements.zigzagAngles.value = segment.zigzag_params.angles ? segment.zigzag_params.angles.join(',') : '';
        elements.zigzagDistances.value = segment.zigzag_params.distances ? segment.zigzag_params.distances.join(',') : '';
        elements.zigzagTimes.value = segment.zigzag_params.times ? segment.zigzag_params.times.join(',') : '';
        validateZigZagParams();
    }
    
    // Load circle parameters if applicable
    if (segment.type_segment === 'cercle' && segment.cercle_params) {
        elements.circleRadius.value = segment.cercle_params.rayon || 5;
        
        // Set turns value
        const turns = segment.cercle_params.tours || 1;
        if ([0.5, 1, 1.5, 2, 2.5, 3].includes(turns)) {
            elements.circleTurns.value = turns.toString();
        } else {
            elements.circleTurns.value = 'custom';
            elements.customCircleTurns.value = turns;
            elements.customTurnsLabel.classList.remove('hidden');
            elements.customCircleTurns.classList.remove('hidden');
        }
        
        calculateCircleDistance();
    }
    
    // Load speed parameters
    if (segment.vitesse) {
        setSpeedMode('modify');
        elements.speedMax.value = segment.vitesse.vitesse_max || '';
        elements.speedBase.value = segment.vitesse.vitesse_base || '';
    } else {
        setSpeedMode('unchanged');
    }
    
    // Load functions
    if (segment.fonctions && segment.fonctions.length > 0) {
        elements.functionCount.value = segment.fonctions.length;
        updateFunctions();
        
        // Set function values
        segment.fonctions.forEach((func, i) => {
            const select = document.querySelector(`.function-select[data-index="${i + 1}"]`);
            const customInput = document.querySelector(`.function-custom-input[data-index="${i + 1}"]`);
            
            if (func.type === 'libre') {
                select.value = 'libre';
                if (customInput) {
                    customInput.value = func.valeur;
                    customInput.classList.remove('hidden');
                }
            } else {
                select.value = func.type;
                if (customInput) {
                    customInput.classList.add('hidden');
                }
            }
        });
    } else {
        elements.functionCount.value = 3;
        updateFunctions();
    }
    
    // Load interrupted traits
    if (segment.traits_interrompus && segment.traits_interrompus.length > 0) {
        elements.enableTraits.checked = true;
        elements.traitsContainer.classList.remove('hidden');
        
        // Clear existing traits
        elements.traitsList.innerHTML = '';
        
        // Add traits
        segment.traits_interrompus.forEach((trait, i) => {
            const traitRow = document.createElement('div');
            traitRow.className = 'trait-row';
            traitRow.innerHTML = `
                <input type="number" class="trait-input" value="${trait}" placeholder="Trait ${i + 1}">
                <button class="remove-trait-btn">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            elements.traitsList.appendChild(traitRow);
            
            // Add event listener to remove button
            traitRow.querySelector('.remove-trait-btn').addEventListener('click', function() {
                traitRow.remove();
            });
        });
    } else {
        elements.enableTraits.checked = false;
        elements.traitsContainer.classList.add('hidden');
    }
    
    // Load end condition
    if (segment.condition_fin) {
        elements.endCondition.value = segment.condition_fin.type;
        updateConditionParams();
        
        // Set condition value based on type
        switch(segment.condition_fin.type) {
            case 'distance':
                if (document.getElementById('condition-distance')) {
                    document.getElementById('condition-distance').value = segment.condition_fin.valeur || '';
                }
                break;
            case 'capteurs':
                if (document.getElementById('condition-capteurs')) {
                    document.getElementById('condition-capteurs').value = segment.condition_fin.nb_capteurs || '';
                }
                break;
            case 'angle':
                if (document.getElementById('condition-angle')) {
                    document.getElementById('condition-angle').value = segment.condition_fin.valeur || '';
                }
                break;
            case 'temps':
                if (document.getElementById('condition-temps')) {
                    document.getElementById('condition-temps').value = segment.condition_fin.valeur_secondes || '';
                }
                break;
            case 'custom':
                if (document.getElementById('condition-custom')) {
                    document.getElementById('condition-custom').value = segment.condition_fin.condition || '';
                }
                break;
        }
    } else {
        elements.endCondition.value = 'aucune';
        updateConditionParams();
    }
    
    // Update current segment
    updateCurrentSegment();
}

// Enter edit mode
function enterEditMode(index) {
    state.editingIndex = index;
    
    // Update form UI
    elements.formIcon.className = 'fas fa-edit';
    elements.formTitle.textContent = 'Modifier le Segment';
    elements.addSegmentBtn.classList.add('hidden');
    elements.updateSegmentBtn.classList.remove('hidden');
    elements.cancelEditBtn.classList.remove('hidden');
    
    // Load segment data into form
    loadSegmentForEdit(index);
    
    showNotification('Mode édition activé', 'info');
}

// Exit edit mode
function exitEditMode() {
    state.editingIndex = null;
    
    // Update form UI
    elements.formIcon.className = 'fas fa-plus';
    elements.formTitle.textContent = 'Créer un Segment';
    elements.addSegmentBtn.classList.remove('hidden');
    elements.updateSegmentBtn.classList.add('hidden');
    elements.cancelEditBtn.classList.add('hidden');
    
    // Reset form to default values
    resetForm();
}

// Cancel edit
function cancelEdit() {
    exitEditMode();
    showNotification('Modification annulée', 'warning');
}

// CORRECTION: Reset form to default values (fonction corrigée)
function resetForm() {
    // Get next ID
    const nextId = Math.max(...state.segments.map(s => s.id), 0) + 1;
    
    // Reset basic fields
    elements.segmentId.value = nextId;
    elements.segmentName.value = `segment_${nextId}`;
    elements.segmentDistance.value = 100;
    elements.segmentType.value = 'ligne_continue';
    elements.lineColor.value = 'noire';
    elements.brakeType.value = 'frein_sec';
    elements.brakeDistance.value = '';
    
    // Hide specialized panels
    elements.zigzagParams.classList.add('hidden');
    elements.circleParams.classList.add('hidden');
    
    // Reset speed
    setSpeedMode('unchanged');
    elements.speedMax.value = '';
    elements.speedBase.value = '';
    
    // Reset functions
    elements.functionCount.value = 3;
    updateFunctions();
    
    // Reset interrupted traits
    elements.enableTraits.checked = false;
    elements.traitsContainer.classList.add('hidden');
    elements.traitsList.innerHTML = `
        <div class="trait-row">
            <input type="number" value="3" class="trait-input" placeholder="Trait 1">
            <button class="remove-trait-btn">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="trait-row">
            <input type="number" value="2" class="trait-input" placeholder="Trait 2">
            <button class="remove-trait-btn">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Setup trait removal listeners for reset traits
    setupTraitRemovalListeners();
    
    // Reset end condition
    elements.endCondition.value = 'aucune';
    updateConditionParams();
    
    // Reset circle parameters
    elements.circleRadius.value = 5;
    elements.circleTurns.value = '1';
    elements.customTurnsLabel.classList.add('hidden');
    elements.customCircleTurns.classList.add('hidden');
    
    // Update current segment
    updateCurrentSegment();
}

// Get functions data from form
function getFunctionsData() {
    const functions = [];
    const selects = document.querySelectorAll('.function-select');
    
    selects.forEach((select, index) => {
        const type = select.value;
        const customInput = document.querySelector(`.function-custom-input[data-index="${index + 1}"]`);
        
        if (type === 'libre' && customInput && customInput.value) {
            functions.push({
                type: 'libre',
                valeur: customInput.value
            });
        } else if (type !== 'libre') {
            functions.push({
                type: type
            });
        }
    });
    
    return functions.length > 0 ? functions : null;
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
    
    // Add brake distance if specified
    if (elements.brakeDistance.value) {
        segment.distance_freinage = parseFloat(elements.brakeDistance.value);
    }
    
    // Add speed if modified
    if (elements.speedModifyBtn.classList.contains('active')) {
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
    
    // Add functions
    const functions = getFunctionsData();
    if (functions) {
        segment.fonctions = functions;
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
    
    // Add ZigZag parameters if type is zigzag
    if (segment.type_segment === 'zigzag') {
        const zigzagParams = {};
        const count = parseInt(elements.zigzagCount.value) || 3;
        
        // Parse angles
        const angles = elements.zigzagAngles.value.split(',').map(a => parseFloat(a.trim())).filter(a => !isNaN(a));
        if (angles.length >= count) {
            zigzagParams.angles = angles.slice(0, count);
        }
        
        // Parse distances
        const distances = elements.zigzagDistances.value.split(',').map(d => parseFloat(d.trim())).filter(d => !isNaN(d));
        if (distances.length >= count) {
            zigzagParams.distances = distances.slice(0, count);
        }
        
        // Parse times (optional)
        const times = elements.zigzagTimes.value.split(',').map(t => parseFloat(t.trim())).filter(t => !isNaN(t));
        if (times.length >= count) {
            zigzagParams.times = times.slice(0, count);
        }
        
        zigzagParams.nb_zigzag = count;
        segment.zigzag_params = zigzagParams;
    }
    
    // Add circle parameters if type is circle
    if (segment.type_segment === 'cercle') {
        const circleParams = {};
        circleParams.rayon = parseFloat(elements.circleRadius.value) || 5;
        
        let turns = 1;
        if (elements.circleTurns.value === 'custom') {
            turns = parseFloat(elements.customCircleTurns.value) || 1;
        } else {
            turns = parseFloat(elements.circleTurns.value) || 1;
        }
        
        circleParams.tours = turns;
        segment.cercle_params = circleParams;
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
    
    // Reset form for next segment
    resetForm();
    
    // Show success message
    showNotification(`Segment "${segment.nom_segment}" ajouté avec succès!`, 'success');
}

// Update existing segment
function updateSegment() {
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    if (state.editingIndex === null) return;
    
    // Create the updated segment object
    const segment = {
        id: state.currentSegment.id,
        nom_segment: state.currentSegment.nom_segment,
        distance_cm: state.currentSegment.distance_cm,
        type_segment: state.currentSegment.type_segment,
        ligne: state.currentSegment.ligne,
        frein: state.currentSegment.frein
    };
    
    // Add brake distance if specified
    if (elements.brakeDistance.value) {
        segment.distance_freinage = parseFloat(elements.brakeDistance.value);
    }
    
    // Add speed if modified
    if (elements.speedModifyBtn.classList.contains('active')) {
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
    
    // Add functions
    const functions = getFunctionsData();
    if (functions) {
        segment.fonctions = functions;
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
    
    // Add ZigZag parameters if type is zigzag
    if (segment.type_segment === 'zigzag') {
        const zigzagParams = {};
        const count = parseInt(elements.zigzagCount.value) || 3;
        
        // Parse angles
        const angles = elements.zigzagAngles.value.split(',').map(a => parseFloat(a.trim())).filter(a => !isNaN(a));
        if (angles.length >= count) {
            zigzagParams.angles = angles.slice(0, count);
        }
        
        // Parse distances
        const distances = elements.zigzagDistances.value.split(',').map(d => parseFloat(d.trim())).filter(d => !isNaN(d));
        if (distances.length >= count) {
            zigzagParams.distances = distances.slice(0, count);
        }
        
        // Parse times (optional)
        const times = elements.zigzagTimes.value.split(',').map(t => parseFloat(t.trim())).filter(t => !isNaN(t));
        if (times.length >= count) {
            zigzagParams.times = times.slice(0, count);
        }
        
        zigzagParams.nb_zigzag = count;
        segment.zigzag_params = zigzagParams;
    }
    
    // Add circle parameters if type is circle
    if (segment.type_segment === 'cercle') {
        const circleParams = {};
        circleParams.rayon = parseFloat(elements.circleRadius.value) || 5;
        
        let turns = 1;
        if (elements.circleTurns.value === 'custom') {
            turns = parseFloat(elements.customCircleTurns.value) || 1;
        } else {
            turns = parseFloat(elements.circleTurns.value) || 1;
        }
        
        circleParams.tours = turns;
        segment.cercle_params = circleParams;
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
    
    // Update the segment in the array
    state.segments[state.editingIndex] = segment;
    
    // Exit edit mode
    exitEditMode();
    
    // Update UI
    renderSegments();
    updateSegmentCount();
    
    // Show success message
    showNotification(`Segment "${segment.nom_segment}" mis à jour avec succès!`, 'success');
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
        let typeIcon = 'fas fa-minus';
        let typeText = segment.type_segment.replace('_', ' ');
        
        if (segment.type_segment === 'cercle') {
            typeBadgeClass = 'badge-blue';
            typeIcon = 'fas fa-circle';
        } else if (segment.type_segment === 'virage') {
            typeBadgeClass = 'badge-yellow';
            typeIcon = 'fas fa-curve-path';
        } else if (segment.type_segment === 'sinus') {
            typeBadgeClass = 'badge-pink';
            typeIcon = 'fas fa-wave-sine';
        } else if (segment.type_segment === 'zigzag') {
            typeBadgeClass = 'badge-orange';
            typeIcon = 'fas fa-wave-square';
        }
        
        // Determine line color badge
        const lineBadgeClass = segment.ligne === 'noire' ? 'badge-gray' : 'badge-white';
        const lineText = segment.ligne === 'noire' ? 'Ligne Noire' : 'Ligne Blanche';
        const lineIcon = segment.ligne === 'noire' ? 'fas fa-square' : 'fas fa-square';
        
        // Determine brake badge
        let brakeBadgeClass = 'badge-red';
        let brakeText = '';
        let brakeIcon = 'fas fa-stop';
        
        if (segment.frein === 'frein_sec') {
            brakeText = 'Frein Sec';
        } else if (segment.frein === 'frein_progressif') {
            brakeText = 'Frein Progressif';
            brakeBadgeClass = 'badge-yellow';
            brakeIcon = 'fas fa-stop-circle';
        } else {
            brakeText = 'Sans Frein';
            brakeBadgeClass = 'badge-gray';
            brakeIcon = 'fas fa-ban';
        }
        
        // Build segment details HTML
        let detailsHTML = '';
        
        // Brake distance
        if (segment.distance_freinage) {
            detailsHTML += `
                <div class="detail-item" style="color: #6c63ff;">
                    <i class="fas fa-ruler-combined"></i>
                    <span class="detail-text">Freinage: ${segment.distance_freinage}cm avant fin</span>
                </div>
            `;
        }
        
        if (segment.vitesse) {
            detailsHTML += `
                <div class="detail-item" style="color: #2a9d8f;">
                    <i class="fas fa-bolt"></i>
                    <span class="detail-text">Vitesse: 
                        ${segment.vitesse.vitesse_max ? `Max: ${segment.vitesse.vitesse_max}` : ''}
                        ${segment.vitesse.vitesse_base ? `, Base: ${segment.vitesse.vitesse_base}` : ''}
                    </span>
                </div>
            `;
        }
        
        if (segment.fonctions) {
            const functionText = segment.fonctions.map(f => {
                if (f.type === 'libre') {
                    return `"${f.valeur}"`;
                }
                return f.type;
            }).join(' → ');
            
            detailsHTML += `
                <div class="detail-item" style="color: #e63946;">
                    <i class="fas fa-car"></i>
                    <span class="detail-text">${functionText}</span>
                </div>
            `;
        }
        
        if (segment.traits_interrompus) {
            detailsHTML += `
                <div class="detail-item" style="color: #e9c46a;">
                    <i class="fas fa-grip-lines"></i>
                    <span class="detail-text">Traits: ${segment.traits_interrompus.join(', ')} cm</span>
                </div>
            `;
        }
        
        if (segment.zigzag_params) {
            detailsHTML += `
                <div class="detail-item" style="color: #f4a261;">
                    <i class="fas fa-wave-square"></i>
                    <span class="detail-text">ZigZag: ${segment.zigzag_params.nb_zigzag} zigzags</span>
                </div>
            `;
        }
        
        if (segment.cercle_params) {
            detailsHTML += `
                <div class="detail-item" style="color: #4a6ee0;">
                    <i class="fas fa-circle"></i>
                    <span class="detail-text">Cercle: R=${segment.cercle_params.rayon}cm × ${segment.cercle_params.tours} tours</span>
                </div>
            `;
        }
        
        if (segment.condition_fin) {
            detailsHTML += `
                <div class="detail-item" style="color: #e63946;">
                    <i class="fas fa-flag-checkered"></i>
                    <span class="detail-text">
                        Fin: ${segment.condition_fin.type}
                        ${segment.condition_fin.valeur ? `: ${segment.condition_fin.valeur}` : ''}
                        ${segment.condition_fin.nb_capteurs ? `: ${segment.condition_fin.nb_capteurs} capteurs` : ''}
                    </span>
                </div>
            `;
        }
        
        html += `
            <div class="segment-card">
                <div class="segment-header">
                    <div>
                        <h3 class="segment-title">${segment.nom_segment}</h3>
                        <div class="segment-badges">
                            <span class="badge badge-gray">
                                <i class="fas fa-hashtag"></i> ID: ${segment.id}
                            </span>
                            <span class="badge badge-blue">
                                <i class="fas fa-ruler"></i> ${segment.distance_cm} cm
                            </span>
                            <span class="badge ${typeBadgeClass}">
                                <i class="${typeIcon}"></i> ${typeText}
                            </span>
                            <span class="badge ${lineBadgeClass}">
                                <i class="${lineIcon}"></i> ${lineText}
                            </span>
                            <span class="badge ${brakeBadgeClass}">
                                <i class="${brakeIcon}"></i> ${brakeText}
                            </span>
                        </div>
                    </div>
                    <div class="segment-actions">
                        <button class="segment-action-btn edit-btn" data-index="${index}" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="segment-action-btn delete-btn" data-index="${index}" title="Supprimer">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                
                <div class="segment-details">
                    ${detailsHTML}
                </div>
            </div>
        `;
    });
    
    elements.segmentListView.innerHTML = html;
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            editSegment(index);
        });
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
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

// Edit a segment
function editSegment(index) {
    enterEditMode(index);
}

// Delete a segment
function deleteSegment(index) {
    if (confirm(`Voulez-vous vraiment supprimer le segment "${state.segments[index].nom_segment}" ?`)) {
        // If we're editing this segment, exit edit mode first
        if (state.editingIndex === index) {
            exitEditMode();
        }
        
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
        elements.toggleViewBtn.innerHTML = '<i class="fas fa-list"></i><span>Vue Liste</span>';
        updateJSONPreview();
    } else {
        state.viewMode = 'list';
        elements.segmentListView.classList.remove('hidden');
        elements.jsonPreviewView.classList.add('hidden');
        elements.viewModeText.textContent = 'Vue JSON';
        elements.toggleViewBtn.innerHTML = '<i class="fas fa-eye"></i><span>Vue JSON</span>';
    }
}

// Update JSON preview
function updateJSONPreview() {
    const jsonData = {
        sequence_segments: state.segments,
        metadata: {
            nombre_segments: state.segments.length,
            date_creation: new Date().toISOString(),
            version: "3.0",
            description: "Séquence de segments générée avec Segment Modeler Pro"
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
            version: "3.0",
            description: "Séquence de segments générée avec Segment Modeler Pro"
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
            version: "3.0"
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
        // Exit edit mode if active
        if (state.editingIndex !== null) {
            exitEditMode();
        }
        
        state.segments = [];
        state.nextId = 1;
        resetForm();
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
    
    // Determine icon and background
    let icon = 'info-circle';
    let bgColor = 'linear-gradient(135deg, #4a6ee0 0%, #3a5ecf 100%)';
    
    if (type === 'success') {
        icon = 'check-circle';
        bgColor = 'linear-gradient(135deg, #2a9d8f 0%, #21867a 100%)';
    } else if (type === 'error') {
        icon = 'exclamation-circle';
        bgColor = 'linear-gradient(135deg, #e63946 0%, #d62828 100%)';
    } else if (type === 'warning') {
        icon = 'exclamation-triangle';
        bgColor = 'linear-gradient(135deg, #e9c46a 0%, #f4a261 100%)';
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 1.5rem;
        right: 1.5rem;
        z-index: 1000;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-md);
        background: ${bgColor};
        color: white;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        box-shadow: var(--shadow-md);
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-${icon}" style="font-size: 1.25rem;"></i>
        <span style="font-weight: 500;">${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .error {
        border-color: #e63946 !important;
        box-shadow: 0 0 0 2px rgba(230, 57, 70, 0.1) !important;
    }
`;
document.head.appendChild(style);

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', initApp);
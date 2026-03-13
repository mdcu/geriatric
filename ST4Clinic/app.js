// Mock Backend Function
async function getStaffInfo(token) {
    // Simulating network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    if (token === '1234') {
        return {
            staffid: 'aisawan.p',
            modules: ['register', 'example'],
            rights: {
                'demographic': 'EDIT',
                'example1': 'EDIT',
                'example2': 'CREATE'
            }
        };
    } else if (token === '5678') {
        return {
            staffid: 'rapas.s',
            modules: ['example'],
            rights: {
                'demographic': 'VIEW',
                'example1': 'CREATE'
            }
        };
    }
    return null;
}

// Mock Backend: Ask SN
async function askSN(sn) {
    // Simulating network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    if (sn === 'SN000000') {
        return {
            sn: 'SN000000',
            data: {
                'demographic': {
                    'timestamp': ['2025-12-15T11:30:00Z'],
                    'sex': ['M'],
                    'dob': ['1952-10-15'],
                    'status': ['married'],
                    'address': ['88/1 Old Town Road, Silver City'],
                    'age': [73]
                },
                'example1': {
                    'timestamp': ['2025-12-15T11:30:00Z'],
                    'score1': [100],
                    'score2': [50],
                    'avg_score': [75],
                    'comment': ['First visit']
                },
                'example2': {
                    'timestamp': ['2025-12-15T11:30:00Z'],
                    'avg_score': [75],
                    'favouritefood': ['["Thai","Western"]']
                },
            },
        };
    }
    return null;
}

// Mock N8N Submission
async function mockSubmitToN8N(payload) {
    console.log("%c[MOCK N8N SUBMISSION]", "color: #28a745; font-weight: bold; font-size: 14px;");
    console.log(JSON.stringify(payload, null, 2));
    
    // Simulate Network Delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true };
}

// Application State
let currentUser = null;

// Initialization
async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        document.body.innerHTML = '<h1>Error: No token provided. Please log in.</h1>';
        return;
    }

    currentUser = await getStaffInfo(token);

    if (!currentUser) {
        document.body.innerHTML = '<h1>Error: Invalid Token.</h1>';
        return;
    }

    renderHeader();
    setupTabs();
    renderAssessTab();
}

function renderHeader() {
    const staffNameEl = document.getElementById('staff-name');
    const dateTimeEl = document.getElementById('date-time');

    if (staffNameEl) staffNameEl.textContent = currentUser.staffid;

    const updateTime = () => {
        const now = new Date();
        if (dateTimeEl) dateTimeEl.textContent = now.toLocaleString();
    };

    updateTime();
    setInterval(updateTime, 1000 * 60); // Update every minute
}

function setupTabs() {
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all
            document.querySelectorAll('.tab-button').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

            // Add active class to clicked
            tab.classList.add('active');
            
            // Show content
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden');
        });
    });
}

function renderAssessTab() {
    const container = document.getElementById('module-list');
    container.innerHTML = ''; // Clear existing

    currentUser.modules.forEach(moduleName => {
        const btn = document.createElement('button');
        btn.className = 'module-btn';
        btn.textContent = moduleName.toUpperCase();
        
        btn.addEventListener('click', () => loadModule(moduleName));
        
        container.appendChild(btn);
    });
}

async function loadModule(moduleName) {
    // 1. Prompt for SN
    const sn = prompt("Please enter Patient SN:");
    if (!sn) return; // User cancelled

    // 2. Check SN with Backend
    const patientData = await askSN(sn);

    if (!patientData) {
        alert("SN not found. Please register this patient first.");
        return; // Return to module list (do nothing)
    }

    // 3. SN Found: Hide module list and prepare content area
    document.getElementById('module-list').classList.add('hidden');
    const contentArea = document.getElementById('assess-content');
    contentArea.innerHTML = ''; // Clear current content

    try {
        // 4. Render Empty Form
        const module = await import(`./modules/${moduleName}.js`);
        
        // Callback to fill a specific form (used by Draw Data button)
        const fillSpecificForm = (formName) => {
            if (patientData.data && patientData.data[formName]) {
                populateFormData({ [formName]: patientData.data[formName] });
            }
        };

        module.render(contentArea, currentUser, patientData, fillSpecificForm);

        // 5. Add Controls (Save / Home)
        renderControls(contentArea, sn, moduleName);

        // 6. Ask to fill data, finding the most recent timestamp across all forms
        let mostRecentTimestamp = null;
        if (patientData.data) {
            for (const formName in patientData.data) {
                const timestamps = patientData.data[formName].timestamp;
                if (timestamps && timestamps.length > 0) {
                    const lastTimestamp = timestamps[timestamps.length - 1];
                    if (!mostRecentTimestamp || new Date(lastTimestamp) > new Date(mostRecentTimestamp)) {
                        mostRecentTimestamp = lastTimestamp;
                    }
                }
            }
        }

        if (mostRecentTimestamp && confirm(`Found previous data from ${new Date(mostRecentTimestamp).toLocaleDateString()}. Do you want to fill the form?`)) {
             populateFormData(patientData.data);
        }

    } catch (error) {
        console.error("Failed to load module", error);
        contentArea.innerHTML = `<p style="color:red">Error loading module: ${moduleName}</p>`;
        // Restore UI on error
        document.getElementById('module-list').classList.remove('hidden');
    }
}

function renderControls(container, sn, moduleName) {
    const div = document.createElement('div');
    div.style.marginTop = '20px';
    div.style.paddingTop = '15px';
    div.style.borderTop = '1px solid #ddd';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save Assessment';
    saveBtn.className = 'module-btn';
    saveBtn.style.backgroundColor = '#28a745';
    saveBtn.onclick = () => saveAssessment(sn, moduleName);

    const homeBtn = document.createElement('button');
    homeBtn.textContent = 'Home';
    homeBtn.className = 'module-btn';
    homeBtn.style.backgroundColor = '#6c757d';
    homeBtn.onclick = () => {
        // Check for unsaved data
        const hasData = Array.from(document.querySelectorAll('#assess-content input, #assess-content select, #assess-content textarea'))
            .some(el => (el.type === 'checkbox' || el.type === 'radio') ? el.checked : el.value.trim() !== '');

        if (hasData) {
            if (!confirm("Data not saved will be lost. Are you sure you want to return to Home?")) {
                return;
            }
        }
        
        document.getElementById('assess-content').innerHTML = '';
        document.getElementById('module-list').classList.remove('hidden');
    };

    div.appendChild(saveBtn);
    div.appendChild(homeBtn);
    container.appendChild(div);
}

function populateFormData(data) {
    for (const formName in data) {
        const formData = data[formName];
        if (!formData.timestamp || formData.timestamp.length === 0) continue;

        // Find the index of the most recent record. Assuming arrays are ordered, it's the last one.
        const lastIndex = formData.timestamp.length - 1;

        for (const field in formData) {
            const inputs = document.querySelectorAll(`[name="${formName}.${field}"]`);
            if (inputs.length === 0) continue;

            const value = formData[field][lastIndex];
            if (value === null || value === undefined) continue;

            const firstInput = inputs[0];

            if (firstInput.type === 'checkbox') {
                let checkedValues = [];
                try {
                    checkedValues = typeof value === 'string' && value.startsWith('[') ? JSON.parse(value) : [value];
                } catch (e) { checkedValues = []; }

                inputs.forEach(input => {
                    if (!input.disabled) {
                        input.checked = checkedValues.includes(input.value);
                        input.dispatchEvent(new Event('change'));
                    }
                });
            } else {
                if (!firstInput.disabled) {
                    firstInput.value = value;
                    firstInput.dispatchEvent(new Event('change'));
                    firstInput.dispatchEvent(new Event('input'));
                }
            }
        }
    }
}

async function saveAssessment(sn, moduleName) {
    const now = new Date();
    // Generate VN: VYYMMDDHHMMSN
    const pad = n => String(n).padStart(2, '0');
    const vnDate = `${String(now.getFullYear()).slice(-2)}${pad(now.getMonth()+1)}${pad(now.getDate())}`;
    const vnTime = `${pad(now.getHours())}${pad(now.getMinutes())}`;
    const vn = `V${vnDate}${vnTime}${sn}`;

    // Collect Data
    const submission = {};
    const inputs = document.querySelectorAll('#assess-content [name]');
    
    inputs.forEach(input => {
        if (input.disabled) return;
        const [form, field] = input.name.split('.');
        if (!form || !field) return;

        if (!submission[form]) submission[form] = {};
        
        if (input.type === 'checkbox') {
            if (input.checked) {
                if (!submission[form][field]) submission[form][field] = [];
                submission[form][field].push(input.value);
            }
        } else {
            submission[form][field] = input.value;
        }
    });

    // Stringify checkbox arrays
    for (const form in submission) {
        for (const field in submission[form]) {
            if (Array.isArray(submission[form][field])) {
                submission[form][field] = JSON.stringify(submission[form][field]);
            }
        }
    }

    const payload = {
        metadata: {
            staffid: currentUser.staffid,
            SN: sn,
            VN: vn,
            timestamp: now.toISOString(),
            moduleid: moduleName
        },
        submission: submission
    };

    // Mock Submit
    const result = await mockSubmitToN8N(payload);
    if (result.success) {
        alert(`Assessment Saved!\nVN: ${vn}\n\n(Check Developer Console for JSON Payload)`);
        document.getElementById('assess-content').innerHTML = '';
        document.getElementById('module-list').classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', init);
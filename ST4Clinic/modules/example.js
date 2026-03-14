import * as Demographic from '../forms/demographic.js';
import * as Example1 from '../forms/example1.js';
import * as Example2 from '../forms/example2.js';

export function render(container, user, patientData, populateCallback) {
    const div = document.createElement('div');
    div.innerHTML = `<h2>Example Assessment</h2>`;
    container.appendChild(div);

    const rights = user?.rights || {};

    // Define which forms belong to this module and their order
    const forms = [
        { key: 'demographic', module: Demographic },
        { key: 'example1', module: Example1 },
        { key: 'example2', module: Example2 }
    ];

    forms.forEach(item => {
        const privilege = rights[item.key];

        // 1. No privilege: Skip rendering
        if (!privilege) return;

        // Render the form into a specific wrapper
        const formWrapper = document.createElement('div');
        item.module.render(formWrapper);
        div.appendChild(formWrapper);

        // Inject "Draw Data" button if historical data exists
        if (patientData && patientData.data && patientData.data[item.key]) {
            const header = formWrapper.querySelector('h3');
            if (header) {
                const btn = document.createElement('button');
                btn.textContent = 'Draw Data';
                btn.style.float = 'right';
                btn.style.fontSize = '0.8rem';
                btn.style.padding = '2px 8px';
                btn.style.cursor = 'pointer';
                btn.onclick = (e) => {
                    e.preventDefault(); // Prevent accidental form submit
                    if (confirm("This will bring data from the previous visit and will overwrite any existing data in this form. Are you sure?")) {
                        populateCallback(item.key);
                    }
                };
                header.appendChild(btn);
            }
        }

        // 2. View privilege: Disable all inputs
        if (privilege === 'VIEW') {
            const inputs = formWrapper.querySelectorAll('input, select, textarea, button');
            inputs.forEach(el => el.disabled = true);
        }
        
        // 3. Create/Edit privilege: Rendered normally (editable)
    });
}
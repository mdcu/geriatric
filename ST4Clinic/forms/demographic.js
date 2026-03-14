export function render(container) {
    const formDiv = document.createElement('div');
    formDiv.className = 'form-section form-demographic';
    formDiv.innerHTML = `
        <h3>Demographic Data</h3>
        
        <div class="form-group">
            <label>Sex</label>
            <select name="demographic.sex">
                <option value="">Select...</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
            </select>
        </div>

        <div class="form-group">
            <label>Date of Birth</label>
            <input type="date" name="demographic.dob">
        </div>

        <div class="form-group">
            <label>Age (Years)</label>
            <input type="number" name="demographic.age" readonly style="background-color: #e9ecef;">
        </div>

        <div class="form-group">
            <label>Marital Status</label>
            <select name="demographic.status">
                <option value="">Select...</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="widow">Widow</option>
            </select>
        </div>

        <div class="form-group">
            <label>Address</label>
            <textarea name="demographic.address"></textarea>
        </div>
    `;

    container.appendChild(formDiv);

    // Logic: Calculate Age
    const dobInput = formDiv.querySelector('[name="demographic.dob"]');
    const ageInput = formDiv.querySelector('[name="demographic.age"]');

    dobInput.addEventListener('change', () => {
        if (!dobInput.value) return;
        const dob = new Date(dobInput.value);
        const diff = Date.now() - dob.getTime();
        const ageDate = new Date(diff);
        ageInput.value = Math.abs(ageDate.getUTCFullYear() - 1970);
    });
}
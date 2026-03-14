export function render(container) {
    const formDiv = document.createElement('div');
    formDiv.className = 'form-section form-example1';
    formDiv.innerHTML = `
        <h3>Example 1</h3>
        
        <div class="form-group">
            <label>Score 1</label>
            <input type="number" name="example1.score1">
        </div>

        <div class="form-group">
            <label>Score 2</label>
            <input type="number" name="example1.score2">
        </div>

        <div class="form-group">
            <label>Average Score</label>
            <input type="number" name="example1.avg_score" readonly style="background-color: #e9ecef;">
        </div>

        <div class="form-group">
            <label>Comment</label>
            <textarea name="example1.comment"></textarea>
        </div>
    `;

    container.appendChild(formDiv);

    // Logic: Calculate Average
    const s1 = formDiv.querySelector('[name="example1.score1"]');
    const s2 = formDiv.querySelector('[name="example1.score2"]');
    const avg = formDiv.querySelector('[name="example1.avg_score"]');

    function calculateAvg() {
        const val1 = parseFloat(s1.value);
        const val2 = parseFloat(s2.value);

        if (!isNaN(val1) && !isNaN(val2)) {
            const mean = (val1 + val2) / 2;
            avg.value = mean;
            // Broadcast event for Example 2
            document.dispatchEvent(new CustomEvent('example1_avg_change', { detail: mean }));
        }
    }

    s1.addEventListener('input', calculateAvg);
    s2.addEventListener('input', calculateAvg);
}
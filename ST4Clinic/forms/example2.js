export function render(container) {
    const formDiv = document.createElement('div');
    formDiv.className = 'form-section form-example2';
    formDiv.innerHTML = `
        <h3>Example 2</h3>
        
        <div class="form-group">
            <label>Average Score (From Ex1)</label>
            <input type="number" name="example2.avg_score">
        </div>

        <div class="form-group">
            <label>Favorite Food</label>
            <div class="checkbox-group">
                <label><input type="checkbox" name="example2.favouritefood" value="Japanese"> Japanese</label>
                <label><input type="checkbox" name="example2.favouritefood" value="Western"> Western</label>
                <label><input type="checkbox" name="example2.favouritefood" value="Thai"> Thai</label>
                <label><input type="checkbox" name="example2.favouritefood" value="Indian"> Indian</label>
                <label><input type="checkbox" name="example2.favouritefood" value="FastFood"> FastFood</label>
                <label><input type="checkbox" name="example2.favouritefood" value="SeaFood"> SeaFood</label>
            </div>
        </div>
    `;

    container.appendChild(formDiv);

    // Logic: Listen for Example 1 updates
    const avgInput = formDiv.querySelector('[name="example2.avg_score"]');

    const handleUpdate = (e) => {
        // Update if exists (user can still overwrite)
        avgInput.value = e.detail;
    };

    document.addEventListener('example1_avg_change', handleUpdate);

    // Initial check for Example 1 existence
    // We use a small timeout to ensure DOM is fully painted if modules load async
    setTimeout(() => {
        const ex1Input = document.querySelector('[name="example1.avg_score"]');
        if (!ex1Input) {
            console.log("Example 1 avg_score input not found in DOM.");
        } else if (ex1Input.value) {
            // Sync initial value if present
            avgInput.value = ex1Input.value;
        }
    }, 100);

    // Cleanup (optional but good practice for SPAs)
    // Since we don't have a strict unmount lifecycle here yet, we leave the listener.
    // Ideally, the module system would handle teardown.
}
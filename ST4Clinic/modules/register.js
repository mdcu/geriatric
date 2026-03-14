export function render(container) {
    const div = document.createElement('div');
    div.className = 'form-section form-demographic';
    div.innerHTML = `
        <h2>Patient Registration</h2>
        <p>Registration form content will go here.</p>
    `;
    container.appendChild(div);
}
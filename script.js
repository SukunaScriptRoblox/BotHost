
// Modal functionality
function showDeployModal() {
    document.getElementById('deployModal').style.display = 'block';
}

function hideDeployModal() {
    document.getElementById('deployModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('deployModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// File upload functionality
document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.background = 'rgba(114, 137, 218, 0.2)';
        uploadArea.style.borderColor = '#5a6ebd';
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.background = '';
        uploadArea.style.borderColor = '#7289da';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.background = '';
        uploadArea.style.borderColor = '#7289da';
        
        const files = e.dataTransfer.files;
        handleFiles(files);
    });
    
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
});

function handleFiles(files) {
    const uploadArea = document.getElementById('uploadArea');
    
    if (files.length > 0) {
        uploadArea.innerHTML = `
            <i class="fas fa-check-circle" style="color: #43b581;"></i>
            <h3>${files.length} file(s) selected</h3>
            <p>Ready to deploy! Fill in the details below.</p>
        `;
    }
}

// Deploy bot functionality
async function deployBot() {
    const botName = document.getElementById('botName').value;
    const botToken = document.getElementById('botToken').value;
    const language = document.getElementById('language').value;
    const fileInput = document.getElementById('fileInput');
    
    if (!botName || !botToken) {
        alert('Please fill in all required fields!');
        return;
    }
    
    if (!fileInput.files.length) {
        alert('Please upload your bot files!');
        return;
    }
    
    // Show loading state
    const deployBtn = document.querySelector('.deploy-btn-modal');
    const originalText = deployBtn.innerHTML;
    deployBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deploying...';
    deployBtn.disabled = true;
    
    try {
        // Prepare form data
        const formData = new FormData();
        formData.append('botName', botName);
        formData.append('botToken', botToken);
        formData.append('language', language);
        
        // Add all files
        for (let i = 0; i < fileInput.files.length; i++) {
            formData.append('files', fileInput.files[i]);
        }
        
        // Deploy bot
        const response = await fetch('/api/deploy-bot', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            deployBtn.innerHTML = '<i class="fas fa-check"></i> Deployed Successfully!';
            deployBtn.style.background = '#43b581';
            
            setTimeout(() => {
                hideDeployModal();
                showSuccessMessage(botName);
                resetForm();
                
                // Reset button
                deployBtn.innerHTML = originalText;
                deployBtn.style.background = '';
                deployBtn.disabled = false;
            }, 2000);
        } else {
            throw new Error(result.message);
        }
        
    } catch (error) {
        console.error('Deployment failed:', error);
        deployBtn.innerHTML = '<i class="fas fa-times"></i> Deployment Failed!';
        deployBtn.style.background = '#f04747';
        
        alert('Deployment failed: ' + error.message);
        
        setTimeout(() => {
            deployBtn.innerHTML = originalText;
            deployBtn.style.background = '';
            deployBtn.disabled = false;
        }, 3000);
    }
}

function resetForm() {
    document.getElementById('botName').value = '';
    document.getElementById('botToken').value = '';
    document.getElementById('language').value = 'python';
    document.getElementById('fileInput').value = '';
    document.getElementById('uploadArea').innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <h3>Upload Your Bot Files</h3>
        <p>Drag & drop your files here or click to browse</p>
    `;
}

function showSuccessMessage(botName) {
    // Create success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #43b581;
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(67, 181, 129, 0.3);
        z-index: 3000;
        animation: slideInRight 0.5s ease;
    `;
    
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <strong>${botName}</strong> deployed successfully! 🎉
    `;
    
    document.body.appendChild(notification);
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 5000);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(32, 34, 37, 0.98)';
    } else {
        navbar.style.background = 'rgba(32, 34, 37, 0.95)';
    }
});

// Add animation to feature cards on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
        }
    });
}, observerOptions);

// Observe feature cards
document.querySelectorAll('.feature-card, .step, .pricing-card').forEach(card => {
    observer.observe(card);
});

// Add fadeInUp animation
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(animationStyle);

// Console welcome message
console.log(`
🤖 Welcome to BotHost! 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Deploy your Discord bots with ease! 
Visit: https://bothost.replit.app
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

// Modal functionality
function showDeployModal() {
    document.getElementById('deployModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('deployModal').style.display = 'none';
}

// File upload handling
function handleFiles(files) {
    const uploadArea = document.getElementById('uploadArea');
    
    if (files.length > 0) {
        uploadArea.innerHTML = `
            <i class="fas fa-check-circle" style="color: #43b581;"></i>
            <h3>${files.length} file(s) selected</h3>
            <p>Ready to deploy! Fill in the details below.</p>
        `;
        
        // Store files for later use
        window.selectedFiles = files;
    }
}

// Deploy bot function
async function deployBot() {
    const botName = document.getElementById('botName').value;
    const botToken = document.getElementById('botToken').value;
    const language = document.getElementById('language').value;
    
    if (!botName || !botToken || !window.selectedFiles) {
        alert('Please fill all fields and select files!');
        return;
    }
    
    const formData = new FormData();
    formData.append('botName', botName);
    formData.append('botToken', botToken);
    formData.append('language', language);
    
    // Add all selected files
    for (let file of window.selectedFiles) {
        formData.append('files', file);
    }
    
    try {
        const response = await fetch('/api/deploy-bot', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`Bot "${botName}" deployed successfully! 🚀`);
            closeModal();
            // Reset form
            document.getElementById('deployForm').reset();
            document.getElementById('uploadArea').innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <h3>Drag & Drop your bot files here</h3>
                <p>or click to browse files</p>
                <input type="file" id="fileInput" multiple style="display: none;">
            `;
        } else {
            alert('Deployment failed: ' + result.message);
        }
    } catch (error) {
        alert('Deployment failed: ' + error.message);
    }
}

// Drag and drop functionality
document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.background = '#40444b';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.background = '#36393f';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.background = '#36393f';
            handleFiles(e.dataTransfer.files);
        });
    }
}); Discord bots with ease! 
Visit: https://bothost.replit.app
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

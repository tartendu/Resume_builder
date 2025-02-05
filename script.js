// State management
let currentSection = 0;
const sections = ['personal', 'education', 'experience', 'skills'];
let currentTemplate = 'modern';
let resumeData = {
    personal: {
        fullName: '',
        jobTitle: '',
        email: '',
        phone: '',
        summary: ''
    },
    education: [],
    experience: [],
    skills: []
};

// Theme management
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    themeToggle.innerHTML = document.body.dataset.theme === 'dark' ? 
        '<i class="fas fa-sun"></i>' : 
        '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', document.body.dataset.theme);
});

// Load saved theme
document.body.dataset.theme = localStorage.getItem('theme') || 'light';
themeToggle.innerHTML = document.body.dataset.theme === 'dark' ? 
    '<i class="fas fa-sun"></i>' : 
    '<i class="fas fa-moon"></i>';

// Load saved data
const savedData = localStorage.getItem('resumeData');
if (savedData) {
    resumeData = JSON.parse(savedData);
    loadSavedData();
}

function loadSavedData() {
    // Load personal info
    document.getElementById('fullName').value = resumeData.personal.fullName || '';
    document.getElementById('jobTitle').value = resumeData.personal.jobTitle || '';
    document.getElementById('email').value = resumeData.personal.email || '';
    document.getElementById('phone').value = resumeData.personal.phone || '';
    document.getElementById('summary').value = resumeData.personal.summary || '';

    // Load education
    resumeData.education.forEach(edu => addEducation(edu));

    // Load experience
    resumeData.experience.forEach(exp => addExperience(exp));

    // Load skills
    resumeData.skills.forEach(skill => addSkill(skill));

    updateResumePreview();
}

// Navigation functions
function updateProgressBar() {
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        step.classList.toggle('active', index <= currentSection);
        // Add completion status
        const isComplete = isStepComplete(index);
        step.classList.toggle('complete', isComplete);
        step.querySelector('i').classList.toggle('fa-check', isComplete);
    });
}

function isStepComplete(stepIndex) {
    switch(stepIndex) {
        case 0: // Personal
            return resumeData.personal.fullName && resumeData.personal.email;
        case 1: // Education
            return resumeData.education.length > 0;
        case 2: // Experience
            return resumeData.experience.length > 0;
        case 3: // Skills
            return resumeData.skills.length > 0;
        default:
            return false;
    }
}

function showSection(index) {
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.form-section')[index].classList.add('active');
    updateProgressBar();
    
    // Update navigation buttons
    document.getElementById('prevButton').style.display = index === 0 ? 'none' : 'flex';
    document.getElementById('nextButton').innerHTML = index === sections.length - 1 ? 
        'Generate Resume <i class="fas fa-check"></i>' : 
        'Next <i class="fas fa-arrow-right"></i>';
}

function nextSection() {
    if (currentSection < sections.length - 1) {
        if (validateCurrentSection()) {
            currentSection++;
            showSection(currentSection);
        }
    } else {
        generateResume();
    }
}

function validateCurrentSection() {
    const section = sections[currentSection];
    let isValid = true;
    let errorMessage = '';

    switch(section) {
        case 'personal':
            const requiredFields = ['fullName', 'email'];
            requiredFields.forEach(field => {
                const input = document.getElementById(field);
                if (!input.value.trim()) {
                    isValid = false;
                    errorMessage = 'Please fill in all required fields';
                    input.classList.add('error');
                }
            });
            break;
        case 'education':
            if (resumeData.education.length === 0) {
                isValid = false;
                errorMessage = 'Please add at least one education entry';
            }
            break;
        case 'experience':
            // Experience is optional
            break;
        case 'skills':
            if (resumeData.skills.length === 0) {
                isValid = false;
                errorMessage = 'Please add at least one skill';
            }
            break;
    }

    if (!isValid) {
        showError(errorMessage);
    }
    return isValid;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    const currentSectionElement = document.querySelector('.form-section.active');
    currentSectionElement.insertBefore(errorDiv, currentSectionElement.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

function prevSection() {
    if (currentSection > 0) {
        currentSection--;
        showSection(currentSection);
    }
}

// Dynamic form elements
function addEducation(data = null) {
    const educationList = document.getElementById('educationList');
    const educationEntry = document.createElement('div');
    educationEntry.className = 'education-entry form-grid';
    
    const uniqueId = Date.now();
    educationEntry.innerHTML = `
        <div class="form-group">
            <label>Institution</label>
            <input type="text" class="education-school" required value="${data?.school || ''}"
                   onchange="updateEducation(${uniqueId})">
        </div>
        <div class="form-group">
            <label>Degree</label>
            <input type="text" class="education-degree" required value="${data?.degree || ''}"
                   onchange="updateEducation(${uniqueId})">
        </div>
        <div class="form-group">
            <label>Start Date</label>
            <input type="month" class="education-start" required value="${data?.startDate || ''}"
                   onchange="updateEducation(${uniqueId})">
        </div>
        <div class="form-group">
            <label>End Date</label>
            <div class="date-input-group">
                <input type="month" class="education-end" ${data?.current ? 'disabled' : ''} 
                       value="${data?.endDate || ''}" onchange="updateEducation(${uniqueId})">
                <label class="checkbox-label">
                    <input type="checkbox" class="current-checkbox" 
                           ${data?.current ? 'checked' : ''} onchange="toggleCurrentEducation(this, ${uniqueId})">
                    Current
                </label>
            </div>
        </div>
        <div class="form-group full-width">
            <label>Description</label>
            <textarea class="education-description" rows="3" 
                      onchange="updateEducation(${uniqueId})">${data?.description || ''}</textarea>
        </div>
        <div class="form-group full-width">
            <div class="entry-actions">
                <button type="button" class="move-button" onclick="moveEducation(${uniqueId}, 'up')">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button type="button" class="move-button" onclick="moveEducation(${uniqueId}, 'down')">
                    <i class="fas fa-arrow-down"></i>
                </button>
                <button type="button" class="remove-button" onclick="removeEducation(${uniqueId})">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `;
    
    educationList.appendChild(educationEntry);
    educationEntry.dataset.id = uniqueId;
    
    if (!data) {
        resumeData.education.push({
            id: uniqueId,
            school: '',
            degree: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ''
        });
    }
    
    updateResumePreview();
    saveData();
}

function updateEducation(id) {
    const entry = document.querySelector(`.education-entry[data-id="${id}"]`);
    const index = resumeData.education.findIndex(e => e.id === id);
    
    if (index !== -1) {
        resumeData.education[index] = {
            id,
            school: entry.querySelector('.education-school').value,
            degree: entry.querySelector('.education-degree').value,
            startDate: entry.querySelector('.education-start').value,
            endDate: entry.querySelector('.education-end').value,
            current: entry.querySelector('.current-checkbox').checked,
            description: entry.querySelector('.education-description').value
        };
        
        updateResumePreview();
        saveData();
    }
}

function toggleCurrentEducation(checkbox, id) {
    const entry = document.querySelector(`.education-entry[data-id="${id}"]`);
    const endDateInput = entry.querySelector('.education-end');
    endDateInput.disabled = checkbox.checked;
    if (checkbox.checked) {
        endDateInput.value = '';
    }
    updateEducation(id);
}

function moveEducation(id, direction) {
    const index = resumeData.education.findIndex(e => e.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= resumeData.education.length) return;
    
    // Swap elements in the array
    [resumeData.education[index], resumeData.education[newIndex]] = 
    [resumeData.education[newIndex], resumeData.education[index]];
    
    // Rebuild education list
    const educationList = document.getElementById('educationList');
    educationList.innerHTML = '';
    resumeData.education.forEach(edu => addEducation(edu));
    
    updateResumePreview();
    saveData();
}

function removeEducation(id) {
    if (confirm('Are you sure you want to remove this education entry?')) {
        const entry = document.querySelector(`.education-entry[data-id="${id}"]`);
        entry.remove();
        
        resumeData.education = resumeData.education.filter(e => e.id !== id);
        updateResumePreview();
        saveData();
    }
}

function addExperience(data = null) {
    const experienceList = document.getElementById('experienceList');
    const experienceEntry = document.createElement('div');
    experienceEntry.className = 'experience-entry form-grid';
    
    const uniqueId = Date.now();
    experienceEntry.innerHTML = `
        <div class="form-group">
            <label>Company</label>
            <input type="text" class="experience-company" required value="${data?.company || ''}"
                   onchange="updateExperience(${uniqueId})">
        </div>
        <div class="form-group">
            <label>Position</label>
            <input type="text" class="experience-position" required value="${data?.position || ''}"
                   onchange="updateExperience(${uniqueId})">
        </div>
        <div class="form-group">
            <label>Start Date</label>
            <input type="month" class="experience-start" required value="${data?.startDate || ''}"
                   onchange="updateExperience(${uniqueId})">
        </div>
        <div class="form-group">
            <label>End Date</label>
            <div class="date-input-group">
                <input type="month" class="experience-end" ${data?.current ? 'disabled' : ''} 
                       value="${data?.endDate || ''}" onchange="updateExperience(${uniqueId})">
                <label class="checkbox-label">
                    <input type="checkbox" class="current-checkbox" 
                           ${data?.current ? 'checked' : ''} onchange="toggleCurrentExperience(this, ${uniqueId})">
                    Current
                </label>
            </div>
        </div>
        <div class="form-group full-width">
            <label>Responsibilities</label>
            <textarea class="experience-responsibilities" rows="4" required 
                      onchange="updateExperience(${uniqueId})">${data?.responsibilities || ''}</textarea>
            <button type="button" class="ai-suggest" onclick="suggestResponsibilities(${uniqueId})">
                <i class="fas fa-magic"></i> AI Suggest
            </button>
        </div>
        <div class="form-group full-width">
            <label>Achievements</label>
            <textarea class="experience-achievements" rows="3" 
                      onchange="updateExperience(${uniqueId})">${data?.achievements || ''}</textarea>
        </div>
        <div class="form-group full-width">
            <div class="entry-actions">
                <button type="button" class="move-button" onclick="moveExperience(${uniqueId}, 'up')">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button type="button" class="move-button" onclick="moveExperience(${uniqueId}, 'down')">
                    <i class="fas fa-arrow-down"></i>
                </button>
                <button type="button" class="remove-button" onclick="removeExperience(${uniqueId})">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `;
    
    experienceList.appendChild(experienceEntry);
    experienceEntry.dataset.id = uniqueId;
    
    if (!data) {
        resumeData.experience.push({
            id: uniqueId,
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            current: false,
            responsibilities: '',
            achievements: ''
        });
    }
    
    updateResumePreview();
    saveData();
}

function updateExperience(id) {
    const entry = document.querySelector(`.experience-entry[data-id="${id}"]`);
    const index = resumeData.experience.findIndex(e => e.id === id);
    
    if (index !== -1) {
        resumeData.experience[index] = {
            id,
            company: entry.querySelector('.experience-company').value,
            position: entry.querySelector('.experience-position').value,
            startDate: entry.querySelector('.experience-start').value,
            endDate: entry.querySelector('.experience-end').value,
            current: entry.querySelector('.current-checkbox').checked,
            responsibilities: entry.querySelector('.experience-responsibilities').value,
            achievements: entry.querySelector('.experience-achievements').value
        };
        
        updateResumePreview();
        saveData();
    }
}

function toggleCurrentExperience(checkbox, id) {
    const entry = document.querySelector(`.experience-entry[data-id="${id}"]`);
    const endDateInput = entry.querySelector('.experience-end');
    endDateInput.disabled = checkbox.checked;
    if (checkbox.checked) {
        endDateInput.value = '';
    }
    updateExperience(id);
}

function moveExperience(id, direction) {
    const index = resumeData.experience.findIndex(e => e.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= resumeData.experience.length) return;
    
    [resumeData.experience[index], resumeData.experience[newIndex]] = 
    [resumeData.experience[newIndex], resumeData.experience[index]];
    
    const experienceList = document.getElementById('experienceList');
    experienceList.innerHTML = '';
    resumeData.experience.forEach(exp => addExperience(exp));
    
    updateResumePreview();
    saveData();
}

function removeExperience(id) {
    if (confirm('Are you sure you want to remove this experience entry?')) {
        const entry = document.querySelector(`.experience-entry[data-id="${id}"]`);
        entry.remove();
        
        resumeData.experience = resumeData.experience.filter(e => e.id !== id);
        updateResumePreview();
        saveData();
    }
}

function addSkill(data = null) {
    const skillsList = document.getElementById('skillsList');
    const skillEntry = document.createElement('div');
    skillEntry.className = 'skill-item';
    
    const uniqueId = Date.now();
    skillEntry.innerHTML = `
        <input type="text" class="skill-name" placeholder="Enter skill" 
               value="${data?.name || ''}" onchange="updateSkill(${uniqueId})">
        <select class="skill-level" onchange="updateSkill(${uniqueId})">
            <option value="Beginner" ${data?.level === 'Beginner' ? 'selected' : ''}>Beginner</option>
            <option value="Intermediate" ${data?.level === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
            <option value="Advanced" ${data?.level === 'Advanced' ? 'selected' : ''}>Advanced</option>
            <option value="Expert" ${data?.level === 'Expert' ? 'selected' : ''}>Expert</option>
        </select>
        <div class="skill-actions">
            <button type="button" class="move-button" onclick="moveSkill(${uniqueId}, 'up')">
                <i class="fas fa-arrow-up"></i>
            </button>
            <button type="button" class="move-button" onclick="moveSkill(${uniqueId}, 'down')">
                <i class="fas fa-arrow-down"></i>
            </button>
            <button type="button" onclick="removeSkill(${uniqueId})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    skillsList.appendChild(skillEntry);
    skillEntry.dataset.id = uniqueId;
    
    if (!data) {
        resumeData.skills.push({
            id: uniqueId,
            name: '',
            level: 'Beginner'
        });
    }
    
    updateResumePreview();
    saveData();
}

function updateSkill(id) {
    const entry = document.querySelector(`.skill-item[data-id="${id}"]`);
    const index = resumeData.skills.findIndex(s => s.id === id);
    
    if (index !== -1) {
        resumeData.skills[index] = {
            id,
            name: entry.querySelector('.skill-name').value,
            level: entry.querySelector('.skill-level').value
        };
        
        updateResumePreview();
        saveData();
    }
}

function moveSkill(id, direction) {
    const index = resumeData.skills.findIndex(s => s.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= resumeData.skills.length) return;
    
    [resumeData.skills[index], resumeData.skills[newIndex]] = 
    [resumeData.skills[newIndex], resumeData.skills[index]];
    
    const skillsList = document.getElementById('skillsList');
    skillsList.innerHTML = '';
    resumeData.skills.forEach(skill => addSkill(skill));
    
    updateResumePreview();
    saveData();
}

function removeSkill(id) {
    const entry = document.querySelector(`.skill-item[data-id="${id}"]`);
    entry.remove();
    
    resumeData.skills = resumeData.skills.filter(s => s.id !== id);
    updateResumePreview();
    saveData();
}

// AI suggestions
async function suggestSummary() {
    const summaryInput = document.getElementById('summary');
    const jobTitle = document.getElementById('jobTitle').value;
    const skills = resumeData.skills.map(s => s.name).join(', ');
    
    const suggestions = [
        `Experienced ${jobTitle} with expertise in ${skills}. Proven track record of delivering high-quality solutions and driving innovation.`,
        `Results-driven ${jobTitle} specializing in ${skills}. Demonstrated ability to lead projects and collaborate effectively with cross-functional teams.`,
        `Detail-oriented ${jobTitle} with strong background in ${skills}. Committed to continuous learning and professional growth.`
    ];
    
    const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    summaryInput.style.opacity = '0';
    setTimeout(() => {
        summaryInput.value = suggestion;
        summaryInput.style.opacity = '1';
        updatePersonalInfo();
    }, 300);
}

async function suggestResponsibilities(id) {
    const entry = document.querySelector(`.experience-entry[data-id="${id}"]`);
    const position = entry.querySelector('.experience-position').value;
    const company = entry.querySelector('.experience-company').value;
    
    const suggestions = [
        `• Led cross-functional teams in developing and implementing innovative solutions\n• Collaborated with stakeholders to define project requirements and deliverables\n• Managed project timelines and resources to ensure on-time delivery`,
        `• Developed and maintained high-quality code following best practices\n• Participated in code reviews and provided constructive feedback\n• Mentored junior team members and facilitated knowledge sharing`,
        `• Designed and implemented scalable solutions for complex business problems\n• Conducted thorough testing and debugging to ensure product quality\n• Documented technical specifications and maintained project documentation`
    ];
    
    const responsibilitiesInput = entry.querySelector('.experience-responsibilities');
    const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    responsibilitiesInput.style.opacity = '0';
    setTimeout(() => {
        responsibilitiesInput.value = suggestion;
        responsibilitiesInput.style.opacity = '1';
        updateExperience(id);
    }, 300);
}

// Template management
function changeTemplate(template) {
    currentTemplate = template;
    updateResumePreview();
    saveData();
}

function formatDate(dateString, current = false) {
    if (!dateString && !current) return '';
    if (current) return 'Present';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function updateResumePreview() {
    const preview = document.getElementById('resumePreview');
    
    // Collect form data
    resumeData.personal = {
        fullName: document.getElementById('fullName').value,
        jobTitle: document.getElementById('jobTitle').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        summary: document.getElementById('summary').value
    };
    
    // Only show sections that have content
    const hasEducation = resumeData.education.length > 0;
    const hasExperience = resumeData.experience.length > 0;
    const hasSkills = resumeData.skills.length > 0;
    const hasSummary = resumeData.personal.summary.trim() !== '';
    
    // Update preview based on template
    if (currentTemplate === 'modern') {
        preview.innerHTML = generateModernTemplate(resumeData, {
            hasEducation,
            hasExperience,
            hasSkills,
            hasSummary
        });
    } else {
        preview.innerHTML = generateClassicTemplate(resumeData, {
            hasEducation,
            hasExperience,
            hasSkills,
            hasSummary
        });
    }
}

function generateModernTemplate(data, flags) {
    const { hasEducation, hasExperience, hasSkills, hasSummary } = flags;
    
    return `
        <div class="modern-resume">
            ${data.personal.fullName || data.personal.jobTitle ? `
                <header class="resume-header" style="background: linear-gradient(135deg, #4a90e2, #357abd); color: white; padding: 40px; border-radius: 8px;">
                    ${data.personal.fullName ? `
                        <h1 style="font-size: 2.5em; margin-bottom: 10px;">${data.personal.fullName}</h1>
                    ` : ''}
                    ${data.personal.jobTitle ? `
                        <h2 style="font-size: 1.5em; opacity: 0.9;">${data.personal.jobTitle}</h2>
                    ` : ''}
                    ${data.personal.email || data.personal.phone ? `
                        <div style="margin-top: 20px;">
                            ${data.personal.email ? `
                                <span><i class="fas fa-envelope"></i> ${data.personal.email}</span>
                            ` : ''}
                            ${data.personal.phone ? `
                                <span style="margin-left: 20px;"><i class="fas fa-phone"></i> ${data.personal.phone}</span>
                            ` : ''}
                        </div>
                    ` : ''}
                </header>
            ` : ''}

            ${hasSummary ? `
                <section style="padding: 20px;">
                    <h3 style="color: #4a90e2; border-bottom: 2px solid #4a90e2; padding-bottom: 10px;">Professional Summary</h3>
                    <p style="margin-top: 15px;">${data.personal.summary}</p>
                </section>
            ` : ''}

            <div style="display: grid; grid-template-columns: ${hasSkills ? '2fr 1fr' : '1fr'}; gap: 30px; padding: 20px;">
                <div>
                    ${hasExperience ? `
                        <section>
                            <h3 style="color: #4a90e2; border-bottom: 2px solid #4a90e2; padding-bottom: 10px;">Experience</h3>
                            ${data.experience.map(exp => `
                                <div style="margin-top: 20px;">
                                    <h4 style="font-size: 1.2em; color: #2c3e50;">${exp.position}</h4>
                                    <h5 style="color: #7f8c8d;">${exp.company}</h5>
                                    <p style="color: #95a5a6; font-size: 0.9em;">
                                        ${formatDate(exp.startDate)} - ${formatDate(exp.endDate, exp.current)}
                                    </p>
                                    ${exp.responsibilities ? `
                                        <div style="margin-top: 10px;">${exp.responsibilities}</div>
                                    ` : ''}
                                    ${exp.achievements ? `
                                        <div style="margin-top: 10px; font-style: italic;">
                                            Key Achievements: ${exp.achievements}
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </section>
                    ` : ''}

                    ${hasEducation ? `
                        <section style="margin-top: 30px;">
                            <h3 style="color: #4a90e2; border-bottom: 2px solid #4a90e2; padding-bottom: 10px;">Education</h3>
                            ${data.education.map(edu => `
                                <div style="margin-top: 20px;">
                                    <h4 style="font-size: 1.2em; color: #2c3e50;">${edu.degree}</h4>
                                    <h5 style="color: #7f8c8d;">${edu.school}</h5>
                                    <p style="color: #95a5a6; font-size: 0.9em;">
                                        ${formatDate(edu.startDate)} - ${formatDate(edu.endDate, edu.current)}
                                    </p>
                                    ${edu.description ? `
                                        <p style="margin-top: 5px;">${edu.description}</p>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </section>
                    ` : ''}
                </div>

                ${hasSkills ? `
                    <div>
                        <section>
                            <h3 style="color: #4a90e2; border-bottom: 2px solid #4a90e2; padding-bottom: 10px;">Skills</h3>
                            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;">
                                ${data.skills.map(skill => `
                                    <span style="background: #f0f4f8; padding: 8px 15px; border-radius: 20px; font-size: 0.9em;">
                                        ${skill.name} • ${skill.level}
                                    </span>
                                `).join('')}
                            </div>
                        </section>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function generateClassicTemplate(data, flags) {
    const { hasEducation, hasExperience, hasSkills, hasSummary } = flags;
    
    return `
        <div class="classic-resume" style="font-family: 'Times New Roman', serif;">
            ${data.personal.fullName || data.personal.jobTitle || data.personal.email || data.personal.phone ? `
                <header style="text-align: center; margin-bottom: 30px;">
                    ${data.personal.fullName ? `
                        <h1 style="font-size: 2em; margin-bottom: 10px;">${data.personal.fullName}</h1>
                    ` : ''}
                    ${data.personal.jobTitle ? `
                        <h2 style="font-size: 1.2em; color: #666;">${data.personal.jobTitle}</h2>
                    ` : ''}
                    ${data.personal.email || data.personal.phone ? `
                        <p style="margin-top: 10px;">
                            ${[data.personal.email, data.personal.phone].filter(Boolean).join(' • ')}
                        </p>
                    ` : ''}
                </header>
            ` : ''}

            ${hasSummary ? `
                <section style="margin-bottom: 25px;">
                    <h3 style="border-bottom: 1px solid #000; padding-bottom: 5px;">Professional Summary</h3>
                    <p style="margin-top: 10px;">${data.personal.summary}</p>
                </section>
             ` : ''}

            ${hasExperience ? `
                <section style="margin-bottom: 25px;">
                    <h3 style="border-bottom: 1px solid #000; padding-bottom: 5px;">Experience</h3>
                    ${data.experience.map(exp => `
                        <div style="margin-top: 15px;">
                            <h4 style="font-weight: bold;">${exp.position}</h4>
                            <h5>${exp.company}, ${formatDate(exp.startDate)} - ${formatDate(exp.endDate, exp.current)}</h5>
                            ${exp.responsibilities ? `
                                <div style="margin-top: 5px;">${exp.responsibilities}</div>
                            ` : ''}
                            ${exp.achievements ? `
                                <div style="margin-top: 5px; font-style: italic;">
                                    Key Achievements: ${exp.achievements}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </section>
            ` : ''}

            ${hasEducation ? `
                <section style="margin-bottom: 25px;">
                    <h3 style="border-bottom: 1px solid #000; padding-bottom: 5px;">Education</h3>
                    ${data.education.map(edu => `
                        <div style="margin-top: 15px;">
                            <h4 style="font-weight: bold;">${edu.degree}</h4>
                            <h5>${edu.school}, ${formatDate(edu.startDate)} - ${formatDate(edu.endDate, edu.current)}</h5>
                            ${edu.description ? `
                                <p style="margin-top: 5px;">${edu.description}</p>
                            ` : ''}
                        </div>
                    `).join('')}
                </section>
            ` : ''}

            ${hasSkills ? `
                <section>
                    <h3 style="border-bottom: 1px solid #000; padding-bottom: 5px;">Skills</h3>
                    <div style="margin-top: 10px;">
                        ${data.skills.map(skill => `
                            <p style="margin-bottom: 5px;">• ${skill.name} - ${skill.level}</p>
                        `).join('')}
                    </div>
                </section>
            ` : ''}
        </div>
    `;
}

// Save and load functionality
function saveData() {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
}

// Form event listeners
document.getElementById('resumeForm').addEventListener('input', (e) => {
    if (e.target.closest('.form-section#personalSection')) {
        updatePersonalInfo();
    }
});

function updatePersonalInfo() {
    resumeData.personal = {
        fullName: document.getElementById('fullName').value,
        jobTitle: document.getElementById('jobTitle').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        summary: document.getElementById('summary').value
    };
    updateResumePreview();
    saveData();
}

// Download functionality
function downloadResume() {
    const preview = document.getElementById('resumePreview');
    const styles = `
        <style>
            @media print {
                body { margin: 0; padding: 20px; }
                .modern-resume { max-width: 100%; }
                .classic-resume { max-width: 100%; }
                @page { margin: 20px; }
            }
        </style>
    `;
    
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <html>
            <head>
                <title>Resume - ${resumeData.personal.fullName || 'Untitled'}</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
                ${styles}
            </head>
            <body>
                ${preview.innerHTML}
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

// Initialize the form
showSection(0);
updateResumePreview();

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
            e.preventDefault();
            saveData();
        } else if (e.key === 'p') {
            e.preventDefault();
            downloadResume();
        }
    }
});
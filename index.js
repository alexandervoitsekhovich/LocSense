// Константы для генерации данных
const TRAFFIC_LEVELS = {
    high: { min: 0.7, max: 1.0, label: "высокая" },
    medium: { min: 0.4, max: 0.69, label: "средняя" },
    low: { min: 0.1, max: 0.39, label: "низкая" }
};

const BUSINESS_TYPE_MULTIPLIERS = {
    "кофейня": 15,
    "фастфуд": 10,
    "аптека": 5,
    "ресторан": 0,
    "магазин одежды": -5
};

// Элементы DOM
const form = document.getElementById('analysisForm');
const resetButton = document.getElementById('resetButton');
const loadingElement = document.getElementById('loading');
const resultsBody = document.getElementById('resultsBody');
const bestRecommendation = document.getElementById('bestRecommendation');
const resultsTable = document.getElementById('resultsTable');

// Валидация формы
function validateForm(formData) {
    let isValid = true;
    
    // Очистка предыдущих ошибок
    document.querySelectorAll('.error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form__input, .form__select, .form__textarea').forEach(el => {
        el.classList.remove('form__input--error', 'form__select--error', 'form__textarea--error');
    });
    
    // Проверка города
    if (!formData.city) {
        document.getElementById('cityError').textContent = 'Выберите город';
        document.getElementById('city').classList.add('form__select--error');
        isValid = false;
    }
    
    // Проверка приоритетов
    if (formData.priority.length === 0) {
        document.getElementById('priorityError').textContent = 'Выберите хотя бы один приоритет';
        isValid = false;
    }
    
    // Проверка территории
    const minArea = parseInt(formData.minArea);
    const maxArea = parseInt(formData.maxArea);
    if (!minArea || !maxArea || minArea <= 0 || maxArea <= 0) {
        document.getElementById('areaError').textContent = 'Введите корректные значения территории';
        document.getElementById('minArea').classList.add('form__input--error');
        document.getElementById('maxArea').classList.add('form__input--error');
        isValid = false;
    } else if (minArea > maxArea) {
        document.getElementById('areaError').textContent = 'Минимальная территория не может быть больше максимальной';
        document.getElementById('minArea').classList.add('form__input--error');
        document.getElementById('maxArea').classList.add('form__input--error');
        isValid = false;
    }
    
    // Проверка аренды
    if (!formData.maxRent || formData.maxRent <= 0) {
        document.getElementById('rentError').textContent = 'Введите корректную стоимость аренды';
        document.getElementById('maxRent').classList.add('form__input--error');
        isValid = false;
    }
    
    // Проверка среднего чека
    const avgCheck = parseInt(formData.avgCheck);
    if (!avgCheck || avgCheck < 100 || avgCheck > 5000) {
        document.getElementById('checkError').textContent = 'Средний чек должен быть от 100 до 5000 ₽';
        document.getElementById('avgCheck').classList.add('form__input--error');
        isValid = false;
    }
    
    // Проверка типа бизнеса
    if (!formData.businessType) {
        document.getElementById('businessTypeError').textContent = 'Выберите тип бизнеса';
        document.getElementById('businessType').classList.add('form__select--error');
        isValid = false;
    }
    
    // Проверка районов
    if (!formData.districts.trim()) {
        document.getElementById('districtsError').textContent = 'Введите хотя бы один район';
        document.getElementById('districts').classList.add('form__textarea--error');
        isValid = false;
    }
    
    return isValid;
}

// Генерация данных для районов
function generateDistrictData(districts, businessType, avgCheck) {
    return districts.map(district => {
        // Генерация проходимости
        const trafficValue = Math.random();
        let trafficLevel;
        if (trafficValue >= TRAFFIC_LEVELS.high.min) {
            trafficLevel = TRAFFIC_LEVELS.high;
        } else if (trafficValue >= TRAFFIC_LEVELS.medium.min) {
            trafficLevel = TRAFFIC_LEVELS.medium;
        } else {
            trafficLevel = TRAFFIC_LEVELS.low;
        }
        
        // Генерация конкуренции
        const competitors = Math.floor(Math.random() * 10) + 1;
        
        // Генерация аренды
        const rent = Math.floor(Math.random() * (4000 - 1500 + 1)) + 1500;
        
        // Генерация среднего чека района
        const avgCheckArea = Math.floor(Math.random() * (700 - 300 + 1)) + 300;
        
        // Расчет индекса привлекательности
        const traffic = trafficValue;
        const businessTypeMultiplier = BUSINESS_TYPE_MULTIPLIERS[businessType] || 0;
        
        const score = Math.max(0, Math.min(100, 
            (traffic * 30) - 
            (competitors * 4) - 
            (rent / 200) + 
            (Math.max(0, avgCheckArea - avgCheck) / 10) + 
            businessTypeMultiplier + 
            Math.random() * 10
        ));
        
        // Определение рекомендации
        let recommendation, recommendationClass;
        if (score >= 80) {
            recommendation = "открывать выгодно 🟢";
            recommendationClass = "indicator--high";
        } else if (score >= 50) {
            recommendation = "средний потенциал 🟡";
            recommendationClass = "indicator--medium";
        } else {
            recommendation = "не рекомендуется 🔴";
            recommendationClass = "indicator--low";
        }
        
        return {
            district,
            traffic: {
                value: trafficValue,
                level: trafficLevel.label,
                class: getTrafficClass(trafficValue)
            },
            competitors: {
                value: competitors,
                class: getCompetitionClass(competitors)
            },
            rent,
            avgCheckArea,
            score: {
                value: Math.round(score),
                class: getScoreClass(score)
            },
            recommendation: {
                text: recommendation,
                class: recommendationClass
            }
        };
    });
}

// Вспомогательные функции для определения классов
function getTrafficClass(trafficValue) {
    if (trafficValue >= TRAFFIC_LEVELS.high.min) return "indicator--high";
    if (trafficValue >= TRAFFIC_LEVELS.medium.min) return "indicator--medium";
    return "indicator--low";
}

function getCompetitionClass(competitors) {
    if (competitors <= 3) return "indicator--high";
    if (competitors <= 6) return "indicator--medium";
    return "indicator--low";
}

function getScoreClass(score) {
    if (score >= 80) return "score--high";
    if (score >= 50) return "score--medium";
    return "score--low";
}

// Отображение результатов
function displayResults(districtData) {
    // Сортировка по индексу привлекательности (по убыванию)
    districtData.sort((a, b) => b.score.value - a.score.value);
    
    // Очистка таблицы
    resultsBody.innerHTML = '';
    
    // Заполнение таблицы
    districtData.forEach(data => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.district}</td>
            <td><span class="indicator ${data.traffic.class}">${data.traffic.level}</span></td>
            <td><span class="indicator ${data.competitors.class}">${data.competitors.value}</span></td>
            <td>${data.rent.toLocaleString('ru-RU')}</td>
            <td>${data.avgCheckArea.toLocaleString('ru-RU')}</td>
            <td><span class="score ${data.score.class}">${data.score.value}</span></td>
            <td><span class="indicator ${data.recommendation.class}">${data.recommendation.text}</span></td>
        `;
        resultsBody.appendChild(row);
    });
    
    // Отображение лучшего района
    const bestDistrict = districtData[0];
    bestRecommendation.textContent = `Рекомендуем: ${bestDistrict.district} — индекс ${bestDistrict.score.value}`;
    bestRecommendation.classList.remove('hidden');
    
    // Показ таблицы
    resultsTable.classList.remove('hidden');
}

// Обработка отправки формы
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Сбор данных формы
    const formData = {
        city: document.getElementById('city').value,
        priority: Array.from(document.querySelectorAll('input[name="priority"]:checked')).map(cb => cb.value),
        minArea: document.getElementById('minArea').value,
        maxArea: document.getElementById('maxArea').value,
        maxRent: document.getElementById('maxRent').value,
        avgCheck: document.getElementById('avgCheck').value,
        businessType: document.getElementById('businessType').value,
        districts: document.getElementById('districts').value
    };
    
    // Валидация
    if (!validateForm(formData)) {
        return;
    }
    
    // Показать загрузку
    loadingElement.classList.remove('hidden');
    resultsTable.classList.add('hidden');
    bestRecommendation.classList.add('hidden');
    
    // Разделение районов
    const districts = formData.districts
        .split('\n')
        .map(d => d.trim())
        .filter(d => d !== '');
    
    // Имитация загрузки
    setTimeout(() => {
        // Генерация данных
        const districtData = generateDistrictData(
            districts, 
            formData.businessType, 
            parseInt(formData.avgCheck)
        );
        
        // Скрыть загрузку и показать результаты
        loadingElement.classList.add('hidden');
        displayResults(districtData);
    }, 1500);
});

// Сброс формы
resetButton.addEventListener('click', function() {
    form.reset();
    resultsBody.innerHTML = '';
    resultsTable.classList.add('hidden');
    bestRecommendation.classList.add('hidden');
    document.querySelectorAll('.error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form__input, .form__select, .form__textarea').forEach(el => {
        el.classList.remove('form__input--error', 'form__select--error', 'form__textarea--error');
    });
});
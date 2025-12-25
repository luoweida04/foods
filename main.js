// 食物数据管理
class FoodManager {
    constructor() {
        this.foods = this.loadFoods();
        this.currentFilter = 'all';
    }

    loadFoods() {
        const saved = localStorage.getItem('foods');
        if (saved) {
            return JSON.parse(saved);
        }
        // 默认食物数据
        return [
            { id: 1, name: '豆浆油条', tags: ['breakfast'] },
            { id: 2, name: '煎饼果子', tags: ['breakfast'] },
            { id: 3, name: '包子馒头', tags: ['breakfast'] },
            { id: 4, name: '牛肉面', tags: ['breakfast', 'lunch', 'dinner'] },
            { id: 5, name: '宫保鸡丁', tags: ['lunch', 'dinner'] },
            { id: 6, name: '麻婆豆腐', tags: ['lunch', 'dinner'] },
            { id: 7, name: '红烧肉', tags: ['lunch', 'dinner'] },
            { id: 8, name: '水煮鱼', tags: ['lunch', 'dinner'] },
            { id: 9, name: '炒饭', tags: ['lunch', 'dinner'] },
            { id: 10, name: '火锅', tags: ['dinner'] },
            { id: 11, name: '烧烤', tags: ['dinner'] },
            { id: 12, name: '披萨', tags: ['lunch', 'dinner'] }
        ];
    }

    saveFoods() {
        localStorage.setItem('foods', JSON.stringify(this.foods));
    }

    addFood(name, tags) {
        if (!name || name.trim() === '') {
            return false;
        }
        
        // 如果没有选择标签，默认包含所有标签
        if (!tags || tags.length === 0) {
            tags = ['breakfast', 'lunch', 'dinner'];
        }

        const newFood = {
            id: Date.now(),
            name: name.trim(),
            tags: tags
        };

        this.foods.push(newFood);
        this.saveFoods();
        return true;
    }

    deleteFood(id) {
        this.foods = this.foods.filter(food => food.id !== id);
        this.saveFoods();
    }

    getFoodsByTag(tag) {
        if (tag === 'all') {
            return this.foods;
        }
        return this.foods.filter(food => food.tags.includes(tag));
    }

    getCurrentTimePeriod() {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 10) {
            return 'breakfast';
        } else if (hour >= 10 && hour < 16) {
            return 'lunch';
        } else {
            return 'dinner';
        }
    }

    getFoodsForCurrentTime() {
        const period = this.getCurrentTimePeriod();
        return this.foods.filter(food => food.tags.includes(period));
    }

    getRandomFood(foods) {
        if (!foods || foods.length === 0) {
            return null;
        }
        const randomIndex = Math.floor(Math.random() * foods.length);
        return foods[randomIndex];
    }
}

// UI管理
class UIManager {
    constructor(foodManager) {
        this.foodManager = foodManager;
        this.isLotterying = false;
        this.initElements();
        this.bindEvents();
        this.updateTime();
        this.renderFoodList();
    }

    initElements() {
        this.lotteryBtn = document.getElementById('lotteryBtn');
        this.lotteryCard = document.getElementById('lotteryCard');
        this.foodInput = document.getElementById('foodInput');
        this.addBtn = document.getElementById('addBtn');
        this.foodList = document.getElementById('foodList');
        this.currentTime = document.getElementById('currentTime');
        this.filterTabs = document.querySelectorAll('.filter-tab');
        this.tagCheckboxes = document.querySelectorAll('.tag-checkbox input[type="checkbox"]');
    }

    bindEvents() {
        this.lotteryBtn.addEventListener('click', () => this.startLottery());
        this.addBtn.addEventListener('click', () => this.addFood());
        this.foodInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addFood();
            }
        });

        this.filterTabs.forEach(tab => {
            tab.addEventListener('click', () => this.filterFoods(tab.dataset.filter));
        });
    }

    updateTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        const period = this.foodManager.getCurrentTimePeriod();
        const periodText = {
            'breakfast': '早餐时段',
            'lunch': '中餐时段',
            'dinner': '晚餐时段'
        };
        
        this.currentTime.textContent = `当前时间：${timeStr} | ${periodText[period]}`;
        setTimeout(() => this.updateTime(), 1000);
    }

    startLottery() {
        if (this.isLotterying) {
            return;
        }

        const availableFoods = this.foodManager.getFoodsForCurrentTime();
        
        if (availableFoods.length === 0) {
            alert('当前时段没有可抽取的食物，请先添加食物！');
            return;
        }

        this.isLotterying = true;
        this.lotteryBtn.disabled = true;
        this.lotteryBtn.querySelector('.btn-text').textContent = '抽取中...';
        
        // 移除之前的result类，开始新的抽奖
        this.lotteryCard.classList.remove('result');
        
        // 开始旋转动画
        this.lotteryCard.classList.add('spinning');
        
        let count = 0;
        const maxCount = 20;
        const interval = setInterval(() => {
            const randomFood = this.foodManager.getRandomFood(availableFoods);
            this.updateLotteryCard(randomFood, false);
            
            count++;
            if (count >= maxCount) {
                clearInterval(interval);
                this.finishLottery(availableFoods);
            }
        }, 100);
    }

    finishLottery(availableFoods) {
        setTimeout(() => {
            const finalFood = this.foodManager.getRandomFood(availableFoods);
            this.lotteryCard.classList.remove('spinning');
            this.lotteryCard.classList.add('result');
            this.updateLotteryCard(finalFood, true);
            
            // 添加粒子爆炸效果
            this.createParticleExplosion();
            
            // 不移除result类，让3D旋转动画持续
            setTimeout(() => {
                this.isLotterying = false;
                this.lotteryBtn.disabled = false;
                this.lotteryBtn.querySelector('.btn-text').textContent = '开始抽奖';
            }, 2000);
        }, 500);
    }

    createParticleExplosion() {
        const colors = ['#4fc3f7', '#00e676', '#ffd54f', '#ff4081', '#7c4dff'];
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                box-shadow: 0 0 10px currentColor;
            `;
            
            const rect = this.lotteryCard.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            
            document.body.appendChild(particle);
            
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 100 + Math.random() * 100;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;
            
            particle.animate([
                { 
                    transform: 'translate(0, 0) scale(1)',
                    opacity: 1
                },
                { 
                    transform: `translate(${tx}px, ${ty}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.4, 0.0, 0.6, 1)'
            }).onfinish = () => particle.remove();
        }
    }

    updateLotteryCard(food, showTags) {
        // 使用可爱的卡通风格食物图标
        const foodIcons = ['🍜', '🍱', '🍛', '🍝', '🍕', '🍔', '🌮', '🌯', '🥗', '🥙', '🍲', '🍳', '🥘', '🍣', '🍤', '🥟', '🍙', '🍘', '🥠', '🍢'];
        const randomIcon = foodIcons[Math.floor(Math.random() * foodIcons.length)];
        
        let html = `
            <div class="food-icon">${randomIcon}</div>
            <div class="food-name">${food.name}</div>
        `;
        
        if (showTags && food.tags.length > 0) {
            html += '<div class="food-tags">';
            food.tags.forEach(tag => {
                const tagText = {
                    'breakfast': '早餐',
                    'lunch': '中餐',
                    'dinner': '晚餐'
                };
                html += `<span class="food-tag ${tag}">${tagText[tag]}</span>`;
            });
            html += '</div>';
        }
        
        this.lotteryCard.innerHTML = html;
    }

    addFood() {
        const name = this.foodInput.value.trim();
        if (!name) {
            alert('请输入食物名称！');
            return;
        }

        const selectedTags = Array.from(this.tagCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        if (this.foodManager.addFood(name, selectedTags)) {
            this.foodInput.value = '';
            this.tagCheckboxes.forEach(cb => cb.checked = false);
            this.renderFoodList();
            
            // 显示成功提示
            this.showToast('添加成功！');
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(30, 136, 229, 0.4);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    filterFoods(filter) {
        this.foodManager.currentFilter = filter;
        
        this.filterTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });
        
        this.renderFoodList();
    }

    renderFoodList() {
        const foods = this.foodManager.getFoodsByTag(this.foodManager.currentFilter);
        
        if (foods.length === 0) {
            this.foodList.innerHTML = '<div class="empty-message">暂无食物，快去添加吧！</div>';
            return;
        }

        this.foodList.innerHTML = foods.map(food => this.createFoodItemHTML(food)).join('');
        
        // 绑定删除按钮事件
        this.foodList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                if (confirm('确定要删除这个食物吗？')) {
                    this.foodManager.deleteFood(id);
                    this.renderFoodList();
                }
            });
        });
    }

    createFoodItemHTML(food) {
        const tagText = {
            'breakfast': '早餐',
            'lunch': '中餐',
            'dinner': '晚餐'
        };

        const tagsHTML = food.tags.map(tag => 
            `<span class="food-tag ${tag}">${tagText[tag]}</span>`
        ).join('');

        return `
            <div class="food-item">
                <div class="food-item-header">
                    <div class="food-item-name">${food.name}</div>
                    <button class="delete-btn" data-id="${food.id}">×</button>
                </div>
                <div class="food-item-tags">${tagsHTML}</div>
            </div>
        `;
    }
}

// 添加动画样式
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
`;
document.head.appendChild(style);

// 初始化应用
const foodManager = new FoodManager();
const uiManager = new UIManager(foodManager);

export { foodManager, uiManager };
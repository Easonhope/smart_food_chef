// 全局变量存储数据
let ingredientsData = [];
let categoriesData = [];
let recipesData = [];
let healthTipsData = [];
let selectedIngredients = {}; // { id: grams }
let activeCategory = 'meat';
let selectedGender = null;
let userNutritionPlan = null;

// 分类标签映射
const categoryLabels = {
    meat: '荤类',
    vegetable: '素类',
    staple: '主食',
    seasoning: '调味'
};

// 食材图标映射（根据食材名称匹配 emoji）
const ingredientIcons = {
    '猪里脊肉': '🥩', '猪五花肉': '🥓', '猪排骨': '🦴', '鸡胸肉': '🍗',
    '鸡腿肉': '🍗', '鸡翅': '🍗', '牛里脊': '🥩', '牛腩': '🥩',
    '羊肉': '🥩', '鸭肉': '🦆', '草鱼': '🐟', '鲈鱼': '🐟',
    '三文鱼': '🐟', '虾': '🦐', '螃蟹': '🦀', '鱿鱼': '🦑',
    '蛤蜊': '🦪', '鸡蛋': '🥚', '鸭蛋': '🥚', '全脂牛奶': '🥛',
    '猪肝': '🥩', '培根': '🥓', '金枪鱼（罐装）': '🐟', '带鱼': '🐟',
    '原味酸奶': '🥛', '菠菜': '🥬', '西兰花': '🥦', '胡萝卜': '🥕',
    '西红柿': '🍅', '黄瓜': '🥒', '白菜': '🥬', '茄子': '🍆',
    '青椒': '🫑', '洋葱': '🧅', '大蒜': '🧄', '生姜': '🫚',
    '香菇': '🍄', '金针菇': '🍄', '豆腐': '🧈', '黄豆': '🫘',
    '绿豆': '🫘', '土豆': '🥔', '冬瓜': '🍈', '南瓜': '🎃',
    '豆芽': '🌱', '芹菜': '🥬', '韭菜': '🌿', '莲藕': '🪷',
    '玉米（鲜）': '🌽', '花椰菜': '🥦', '白米饭（熟）': '🍚',
    '大米（生）': '🍚', '糙米': '🍚', '小麦面粉（中筋）': '🌾',
    '全麦面粉': '🌾', '白面包': '🍞', '全麦面包': '🍞',
    '挂面（干）': '🍜', '意大利面（干）': '🍝', '燕麦片': '🌾',
    '小米': '🌾', '玉米面': '🌾', '红薯': '🍠', '山药': '🍠',
    '馒头': '🥟', '荞麦面': '🍜', '藜麦': '🌾', '糯米': '🍚',
    '粉丝（干）': '🍜', '饺子皮': '🥟', '薏米': '🌾', '黑米': '🍚',
    '高粱米': '🌾', '芋头': '🍠', '木薯淀粉': '🧂', '食盐': '🧂',
    '白砂糖': '🍬', '生抽酱油': '🫗', '老抽酱油': '🫗',
    '菜籽油': '🫒', '香油（芝麻油）': '🫒', '米醋': '🍶',
    '料酒': '🍶', '豆瓣酱': '🫙', '甜面酱': '🫙', '番茄酱': '🍅',
    '蚝油': '🫙', '花椒': '🌶️', '八角': '🌿', '辣椒粉': '🌶️',
    '淀粉（玉米）': '🌽', '蜂蜜': '🍯', '黄油': '🧈', '橄榄油': '🫒',
    '芥末酱': '🟡', '花生酱': '🥜', '芝麻酱': '🫘', '胡椒粉': '🌶️',
    '五香粉': '🧂', '鸡精': '🧂'
};

// BMR 计算相关常量
const ACTIVITY_MULTIPLIER = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  heavy: 1.725,
  athlete: 1.9
};

const MACRO_RATIOS = {
  muscle: { protein: 0.25, fat: 0.25, carbs: 0.5 },
  fat_loss: { protein: 0.30, fat: 0.25, carbs: 0.45 },
  aggressive_cut: { protein: 0.35, fat: 0.25, carbs: 0.40 },
  maintain: { protein: 0.25, fat: 0.30, carbs: 0.45 }
};

// 获取食材图标
function getIngredientIcon(name) {
    return ingredientIcons[name] || '🍽️';
}

// 页面加载完成后执行
window.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadIngredientsData();
        await loadHealthTipsData();
        renderCategoryTabs();
        renderIngredients();
        updateNutritionData();
        initEventListeners();
        displayRandomHealthTip();
    } catch (error) {
        console.error('加载数据失败:', error);
    }
});

// 初始化事件监听
function initEventListeners() {
    // 食材仓库鼠标滚轮翻页（使用原生滚动）
    const ingredientsGrid = document.getElementById('ingredients-grid');
    if (ingredientsGrid) {
        ingredientsGrid.addEventListener('wheel', (e) => {
            // 允许原生滚动行为
        }, { passive: true });
    }

    // 关于按钮
    const btnAbout = document.getElementById('btn-about');
    if (btnAbout) {
        btnAbout.addEventListener('click', () => openModal('modal-about'));
    }

    // 使用帮助按钮
    const btnHelp = document.getElementById('btn-help');
    if (btnHelp) {
        btnHelp.addEventListener('click', () => openModal('modal-help'));
    }

    // 个性化服务按钮
    const btnPersonalize = document.getElementById('btn-personalize');
    if (btnPersonalize) {
        btnPersonalize.addEventListener('click', () => openModal('modal-personalize'));
    }

    // 初始化性别按钮事件监听器
    initGenderButtonEvents();

    // 提交个性化表单
    const btnSubmitPersonalize = document.getElementById('btn-submit-personalize');
    if (btnSubmitPersonalize) {
        btnSubmitPersonalize.addEventListener('click', submitPersonalizeForm);
    }

    // 为实时配方和数据看板添加鼠标滚轮翻页功能
    initScrollableContainers();

    // 刷新健康小知识
    const btnRefreshTip = document.getElementById('btn-refresh-tip');
    if (btnRefreshTip) {
        btnRefreshTip.addEventListener('click', displayRandomHealthTip);
    }

    // 点击模态框背景关闭
    const modalAbout = document.getElementById('modal-about');
    const modalHelp = document.getElementById('modal-help');
    const modalPersonalize = document.getElementById('modal-personalize');
    
    if (modalAbout) {
        modalAbout.addEventListener('click', (e) => {
            if (e.target === modalAbout) closeModal('modal-about');
        });
    }
    if (modalHelp) {
        modalHelp.addEventListener('click', (e) => {
            if (e.target === modalHelp) closeModal('modal-help');
        });
    }
    if (modalPersonalize) {
        modalPersonalize.addEventListener('click', (e) => {
            if (e.target === modalPersonalize) closeModal('modal-personalize');
        });
    }
}

// 打开模态框
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

// 为性别按钮添加事件监听器
function initGenderButtonEvents() {
    // 直接获取性别按钮元素
    const genderMale = document.getElementById('gender-male');
    const genderFemale = document.getElementById('gender-female');
    
    if (genderMale && genderFemale) {
        // 为男性按钮添加点击事件
        genderMale.addEventListener('click', () => {
            selectedGender = 'male';
            // 更新按钮样式
            genderMale.className = 'flex h-10 items-center justify-center rounded-xl border border-primary bg-primary/10 text-sm font-medium text-primary transition-all';
            genderFemale.className = 'flex h-10 items-center justify-center rounded-xl border border-border/50 bg-muted/50 text-sm font-medium text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground';
        });
        
        // 为女性按钮添加点击事件
        genderFemale.addEventListener('click', () => {
            selectedGender = 'female';
            // 更新按钮样式
            genderFemale.className = 'flex h-10 items-center justify-center rounded-xl border border-primary bg-primary/10 text-sm font-medium text-primary transition-all';
            genderMale.className = 'flex h-10 items-center justify-center rounded-xl border border-border/50 bg-muted/50 text-sm font-medium text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground';
        });
    }
}

// 为实时配方和数据看板添加鼠标滚轮翻页功能
function initScrollableContainers() {
    // 实时配方容器 - selected-list
    const recipePanel = document.getElementById('selected-list');
    if (recipePanel) {
        // 移除多余的阻止默认事件，使用原生滚动
        recipePanel.addEventListener('wheel', (e) => {
            // 允许原生滚动行为
        }, { passive: true });
    }

    // 数据看板容器 - nutrition-panel
    const nutritionPanel = document.getElementById('nutrition-panel');
    if (nutritionPanel) {
        // 移除多余的阻止默认事件，使用原生滚动
        nutritionPanel.addEventListener('wheel', (e) => {
            // 允许原生滚动行为
        }, { passive: true });
    }
}

// 关闭模态框
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
}

// 提交个性化表单
function submitPersonalizeForm() {
    const height = parseInt(document.getElementById('height').value);
    const weight = parseInt(document.getElementById('weight').value);
    const age = parseInt(document.getElementById('age').value);
    const activityLevel = document.getElementById('activity-level').value;
    const goal = document.getElementById('goal').value;

    if (!height || !weight || !age || !selectedGender || !activityLevel || !goal) {
        alert('请填写完整的个人信息');
        return;
    }

    // 计算营养计划
    const userData = {
        gender: selectedGender,
        weight: weight,
        height: height,
        age: age,
        activityLevel: activityLevel,
        goal: goal
    };

    userNutritionPlan = getNutritionPlan(userData);
    updateTargetNutritionDisplay();
    closeModal('modal-personalize');
}

// 加载健康小知识数据
async function loadHealthTipsData() {
    try {
        const response = await fetch('data/health-tips.json');
        if (!response.ok) {
            throw new Error('加载健康小知识失败');
        }
        const data = await response.json();
        healthTipsData = data.healthTips;
    } catch (error) {
        console.error('加载健康小知识失败:', error);
        healthTipsData = [
            '每天饮水 2000ml，保持身体水分平衡，促进新陈代谢。',
            '蛋白质摄入建议每公斤体重 1.2-2g，有助于肌肉修复与生长。'
        ];
    }
}

// 显示随机健康小知识
function displayRandomHealthTip() {
    const tipElement = document.getElementById('health-tip');
    if (tipElement && healthTipsData.length > 0) {
        const randomIndex = Math.floor(Math.random() * healthTipsData.length);
        tipElement.textContent = healthTipsData[randomIndex];
    }
}

// 加载食材和菜谱数据
async function loadIngredientsData() {
    // 加载食材数据
    const ingredientsResponse = await fetch('data/ingredients.json');
    if (!ingredientsResponse.ok) {
        throw new Error('加载食材数据失败');
    }
    const ingredientsDataObj = await ingredientsResponse.json();
    ingredientsData = ingredientsDataObj.ingredients;
    categoriesData = ingredientsDataObj.categories;
    
    // 加载菜谱数据
    const recipesResponse = await fetch('data/recipes.json');
    if (!recipesResponse.ok) {
        throw new Error('加载菜谱数据失败');
    }
    const recipesDataObj = await recipesResponse.json();
    recipesData = recipesDataObj.recipes;
}

// 渲染分类标签
function renderCategoryTabs() {
    const container = document.getElementById('category-tabs');
    const categories = ['meat', 'vegetable', 'staple', 'seasoning'];
    
    container.innerHTML = categories.map(category => `
        <button
            onclick="setActiveCategory('${category}')"
            class="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                activeCategory === category
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
            }"
        >
            ${categoryLabels[category]}
        </button>
    `).join('');
}

// 设置当前分类
function setActiveCategory(category) {
    activeCategory = category;
    renderCategoryTabs();
    renderIngredients();
}

// 渲染食材卡片
function renderIngredients() {
    const container = document.getElementById('ingredients-grid');
    const filteredIngredients = ingredientsData.filter(
        ingredient => ingredient.category === activeCategory
    );
    
    container.innerHTML = filteredIngredients.map(ingredient => {
        const isSelected = selectedIngredients.hasOwnProperty(ingredient.id);
        const calories = ingredient.per_100g.calories;
        
        return `
            <button
                onclick="toggleIngredient('${ingredient.id}')"
                class="relative flex flex-col items-center gap-2 rounded-2xl border-2 bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md ${
                    isSelected
                        ? 'border-primary bg-primary/5 shadow-primary/20'
                        : 'border-transparent hover:border-primary/30'
                }"
            >
                ${isSelected ? `
                    <div class="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <svg class="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                ` : ''}
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-2xl">
                    ${getIngredientIcon(ingredient.name)}
                </div>
                <div class="text-center">
                    <p class="font-medium text-foreground">${ingredient.name}</p>
                    <p class="text-xs text-muted-foreground">${calories} kcal/100g</p>
                </div>
            </button>
        `;
    }).join('');
}

// 切换食材选中状态
function toggleIngredient(id) {
    if (selectedIngredients.hasOwnProperty(id)) {
        delete selectedIngredients[id];
    } else {
        selectedIngredients[id] = 100; // 默认 100g
    }
    renderIngredients();
    renderSelectedList();
    updateNutritionData();
}

// 移除食材
function removeIngredient(id) {
    delete selectedIngredients[id];
    renderIngredients();
    renderSelectedList();
    updateNutritionData();
}

// 更新食材克重
function updateIngredientAmount(id, amount) {
    const validAmount = Math.max(1, parseInt(amount) || 100);
    selectedIngredients[id] = validAmount;
    updateNutritionData();
}

// 增减食材克重
function changeIngredientAmount(id, delta) {
    const currentAmount = selectedIngredients[id] || 100;
    const newAmount = Math.max(1, currentAmount + delta);
    selectedIngredients[id] = newAmount;
    renderSelectedList();
    updateNutritionData();
}

// 渲染已选食材列表（中间面板）
function renderSelectedList() {
    const tagsContainer = document.getElementById('selected-tags');
    const listContainer = document.getElementById('selected-list');
    
    const selectedItems = ingredientsData.filter(ing => selectedIngredients.hasOwnProperty(ing.id));
    
    if (selectedItems.length === 0) {
        tagsContainer.innerHTML = '';
        listContainer.innerHTML = `
            <div class="flex flex-1 flex-col items-center justify-center text-center">
                <div class="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                    <span class="text-3xl">➕</span>
                </div>
                <p class="text-muted-foreground">从左侧选择食材</p>
                <p class="text-sm text-muted-foreground/70">开始创建您的配方</p>
            </div>
        `;
        return;
    }
    
    // 渲染标签
    tagsContainer.innerHTML = selectedItems.map(ingredient => `
        <span class="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            <span>${getIngredientIcon(ingredient.name)}</span>
            ${ingredient.name}
            <button onclick="removeIngredient('${ingredient.id}')" class="ml-0.5 rounded-full p-0.5 hover:bg-primary/20">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </span>
    `).join('');
    
    // 渲染克重调节列表
    listContainer.innerHTML = selectedItems.map(ingredient => `
        <div class="flex items-center justify-between rounded-xl bg-muted/50 p-3">
            <div class="flex items-center gap-2">
                <span class="text-lg">${getIngredientIcon(ingredient.name)}</span>
                <span class="font-medium text-foreground">${ingredient.name}</span>
            </div>
            <div class="flex items-center gap-2">
                <button
                    onclick="changeIngredientAmount('${ingredient.id}', -10)"
                    class="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-muted"
                >
                    <span class="text-lg">−</span>
                </button>
                <div class="relative">
                    <input
                        type="number"
                        value="${selectedIngredients[ingredient.id]}"
                        onchange="updateIngredientAmount('${ingredient.id}', this.value)"
                        class="h-8 w-20 rounded-lg border border-input bg-card px-2 pr-6 text-center text-sm"
                        min="1"
                    />
                    <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">g</span>
                </div>
                <button
                    onclick="changeIngredientAmount('${ingredient.id}', 10)"
                    class="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-muted"
                >
                    <span class="text-lg">➕</span>
                </button>
            </div>
        </div>
    `).join('');
}

// 更新营养数据
function updateNutritionData() {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    
    // 计算所有选中食材的营养数据
    Object.entries(selectedIngredients).forEach(([ingredientId, weight]) => {
        const ingredient = ingredientsData.find(item => item.id === ingredientId);
        if (ingredient) {
            const ratio = weight / 100;
            totalCalories += ingredient.per_100g.calories * ratio;
            totalProtein += ingredient.per_100g.protein * ratio;
            totalFat += ingredient.per_100g.fat * ratio;
            totalCarbs += ingredient.per_100g.carbs * ratio;
        }
    });
    
    // 更新营养面板显示
    document.getElementById('total-calories').textContent = Math.round(totalCalories);
    document.getElementById('total-protein').textContent = `${totalProtein.toFixed(1)}g`;
    document.getElementById('total-carbs').textContent = `${totalCarbs.toFixed(1)}g`;
    document.getElementById('total-fat').textContent = `${totalFat.toFixed(1)}g`;
    
    // 计算并更新剩余营养成分
    if (userNutritionPlan) {
        const remainingCalories = Math.max(0, userNutritionPlan.targetCalories - Math.round(totalCalories));
        const remainingProtein = Math.max(0, userNutritionPlan.macros.protein_g - totalProtein);
        const remainingCarbs = Math.max(0, userNutritionPlan.macros.carbs_g - totalCarbs);
        const remainingFat = Math.max(0, userNutritionPlan.macros.fat_g - totalFat);
        
        document.getElementById('remaining-calories').textContent = `还需 ${remainingCalories} kcal`;
        document.getElementById('remaining-protein').textContent = `还需 ${remainingProtein.toFixed(1)} g`;
        document.getElementById('remaining-carbs').textContent = `还需 ${remainingCarbs.toFixed(1)} g`;
        document.getElementById('remaining-fat').textContent = `还需 ${remainingFat.toFixed(1)} g`;
    } else {
        document.getElementById('remaining-calories').textContent = '-- kcal';
        document.getElementById('remaining-protein').textContent = '-- g';
        document.getElementById('remaining-carbs').textContent = '-- g';
        document.getElementById('remaining-fat').textContent = '-- g';
    }
    
    // 更新环形图
    updateMacroRing('protein-ring', totalProtein, 50);
    updateMacroRing('carbs-ring', totalCarbs, 100);
    updateMacroRing('fat-ring', totalFat, 50);
    
    // 匹配菜谱
    matchRecipes();
}

// 更新目标营养显示
function updateTargetNutritionDisplay() {
    if (userNutritionPlan) {
        document.getElementById('target-calories').textContent = userNutritionPlan.targetCalories + ' kcal';
        document.getElementById('target-protein').textContent = userNutritionPlan.macros.protein_g + ' g';
        document.getElementById('target-carbs').textContent = userNutritionPlan.macros.carbs_g + ' g';
        document.getElementById('target-fat').textContent = userNutritionPlan.macros.fat_g + ' g';
        
        // 同时更新剩余营养成分
        updateNutritionData();
    }
}

// 更新宏量营养素环形图
function updateMacroRing(ringId, value, max) {
    const ring = document.getElementById(ringId);
    if (ring) {
        const percentage = Math.min((value / max) * 100, 100);
        const circumference = 2 * Math.PI * 36; // r=36
        const strokeDashoffset = circumference - (percentage / 100) * circumference;
        ring.style.strokeDashoffset = strokeDashoffset;
    }
}

// 匹配菜谱
function matchRecipes() {
    const container = document.getElementById('recipes-container');
    const selectedIngredientIds = Object.keys(selectedIngredients);
    
    // 如果没有选择食材，显示提示
    if (selectedIngredientIds.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center">
                <p class="text-sm text-muted-foreground">选择食材以获取推荐</p>
            </div>
        `;
        return;
    }
    
    // 计算每个菜谱的匹配度
    const matchedRecipes = recipesData.map(recipe => {
        const intersection = recipe.ingredients.filter(id => selectedIngredientIds.includes(id));
        const matchRate = intersection.length / recipe.ingredients.length;
        return {
            ...recipe,
            matchRate,
            matchedCount: intersection.length
        };
    });
    
    // 按匹配度排序
    matchedRecipes.sort((a, b) => b.matchRate - a.matchRate);
    
    // 筛选匹配度 >= 70% 的菜谱
    const highMatchRecipes = matchedRecipes.filter(recipe => recipe.matchRate >= 0.7);
    
    // 渲染菜谱
    if (highMatchRecipes.length > 0) {
        renderRecipeCards(highMatchRecipes);
    } else {
        // 显示匹配度最高的前三道菜
        const topRecipes = matchedRecipes.slice(0, 3);
        container.innerHTML = `
            <div class="text-center text-xs text-muted-foreground mb-2">未找到相关食谱，为您推荐以下菜品</div>
        `;
        renderRecipeCards(topRecipes);
    }
}

// 渲染菜谱卡片
function renderRecipeCards(recipes) {
    const container = document.getElementById('recipes-container');
    
    const html = recipes.map(recipe => {
        const matchRate = Math.round(recipe.matchRate * 100);
        
        return `
            <div
                onclick="window.open('${recipe.url}', '_blank')"
                class="group cursor-pointer rounded-xl bg-muted/50 p-3 transition-all hover:bg-muted hover:shadow-sm active:scale-[0.98]"
            >
                <div class="mb-2 flex items-start justify-between">
                    <h4 class="font-medium text-foreground">${recipe.name}</h4>
                    <span class="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                        ${matchRate}%
                    </span>
                </div>
                <p class="text-xs text-muted-foreground">${recipe.category} | ${recipe.difficulty} | ${recipe.cook_time_min}分钟</p>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// BMR 计算函数
function calculateBMR({ gender, weight, height, age }) {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

// TDEE 计算函数
function calculateTDEE(bmr, activityLevel) {
  return bmr * (ACTIVITY_MULTIPLIER[activityLevel] || 1.2);
}

// 热量目标调整函数
function adjustCalories(tdee, goal) {
  switch (goal) {
    case 'muscle':
      return tdee * 1.1;
    case 'fat_loss':
      return tdee * 0.8;
    case 'aggressive_cut':
      return tdee * 0.7;
    case 'maintain':
    default:
      return tdee;
  }
}

// 宏量营养素计算函数
function calculateMacros(calories, goal, weight) {
  const ratio = MACRO_RATIOS[goal] || MACRO_RATIOS.maintain;

  let proteinCalories = calories * ratio.protein;
  let fatCalories = calories * ratio.fat;
  let carbCalories = calories * ratio.carbs;

  let protein_g = proteinCalories / 4;
  let fat_g = fatCalories / 9;
  let carbs_g = carbCalories / 4;

  // 保护机制
  const minProtein = weight * 1.6;
  const minFat = weight * 0.6;

  if (protein_g < minProtein) {
    protein_g = minProtein;
  }

  if (fat_g < minFat) {
    fat_g = minFat;
  }

  // 重新计算剩余碳水
  const usedCalories = protein_g * 4 + fat_g * 9;
  const remainingCalories = calories - usedCalories;

  carbs_g = Math.max(0, remainingCalories / 4);

  return {
    protein_g: Math.round(protein_g),
    fat_g: Math.round(fat_g),
    carbs_g: Math.round(carbs_g)
  };
}

// 最低热量保护
function applyCalorieFloor(calories, gender) {
  const minCalories = gender === 'male' ? 1500 : 1200;
  return Math.max(calories, minCalories);
}

// 主函数（统一入口）
function getNutritionPlan(user) {
  const {
    gender,       // 'male' | 'female'
    weight,       // kg
    height,       // cm
    age,
    activityLevel, // sedentary | light | moderate | heavy | athlete
    goal          // muscle | fat_loss | aggressive_cut | maintain
  } = user;

  const bmr = calculateBMR({ gender, weight, height, age });

  const tdee = calculateTDEE(bmr, activityLevel);

  let targetCalories = adjustCalories(tdee, goal);

  targetCalories = applyCalorieFloor(targetCalories, gender);

  const macros = calculateMacros(targetCalories, goal, weight);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    macros
  };
}
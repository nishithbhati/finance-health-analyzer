        // --- Select DOM Elements ---
        const incomeInput = document.getElementById('income-input');
        const setIncomeBtn = document.getElementById('set-income-btn');
        const expenseNameInput = document.getElementById('expense-name');
        const expenseAmountInput = document.getElementById('expense-amount');
        const addExpenseBtn = document.getElementById('add-expense-btn');
        const expenseList = document.getElementById('expense-list');
        const totalBalanceEl = document.getElementById('total-balance');
        const clearBtn = document.getElementById('clear-btn');

        // Labels & Bars
        const needsBar = document.getElementById('needs-bar');
        const wantsBar = document.getElementById('wants-bar');
        const savingsBar = document.getElementById('savings-bar');
        const needsVal = document.getElementById('needs-val');
        const wantsVal = document.getElementById('wants-val');
        const savingsVal = document.getElementById('savings-val');

        // --- State Management ---
        let state = {
            income: 0,
            expenses: []
        };

        // --- Initialization ---
        function init() {
            const storedState = localStorage.getItem('financeState');
            if (storedState) {
                state = JSON.parse(storedState);
                incomeInput.value = state.income;
            }
            updateUI();
        }

        // --- Core Functions ---

        // 1. Set Income
        setIncomeBtn.addEventListener('click', () => {
            const val = parseFloat(incomeInput.value);
            if (val > 0) {
                state.income = val;
                saveState();
                updateUI();
            }
        });

        // 2. Add Expense
        addExpenseBtn.addEventListener('click', () => {
            const name = expenseNameInput.value;
            const amount = parseFloat(expenseAmountInput.value);

            if (name.trim() === '' || isNaN(amount) || amount <= 0) {
                alert('Please enter a valid name and amount.');
                return;
            }

            const expense = {
                id: Date.now(),
                name: name,
                amount: amount
            };

            state.expenses.push(expense);
            saveState();
            updateUI();
            
            expenseNameInput.value = '';
            expenseAmountInput.value = '';
        });

        // 3. Delete Expense
        function deleteExpense(id) {
            state.expenses = state.expenses.filter(exp => exp.id !== id);
            saveState();
            updateUI();
        }

        // 4. Clear All
        clearBtn.addEventListener('click', () => {
            if(confirm("Are you sure you want to clear all data?")) {
                state = { income: 0, expenses: [] };
                localStorage.removeItem('financeState');
                incomeInput.value = '';
                updateUI();
            }
        });

        // 5. Save to LocalStorage
        function saveState() {
            localStorage.setItem('financeState', JSON.stringify(state));
        }

        // --- Calculation & UI Logic ---

        function updateUI() {
            // A. Calculate Total Expenses
            const totalExpenses = state.expenses.reduce((acc, item) => acc + item.amount, 0);
            
            // B. Update Balance
            const balance = state.income - totalExpenses;
            totalBalanceEl.textContent = `$${balance.toFixed(2)}`;
            
            if (balance < 0) {
                totalBalanceEl.style.color = 'var(--danger-color)';
            } else {
                totalBalanceEl.style.color = 'var(--text-main)';
            }

            // C. Update List
            expenseList.innerHTML = '';
            state.expenses.forEach(expense => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="expense-info">
                        <span class="expense-name">${expense.name}</span>
                        <span class="expense-amount">$${expense.amount.toFixed(2)}</span>
                    </span>
                    <button class="btn-danger" onclick="deleteExpense(${expense.id})">Delete</button>
                `;
                expenseList.appendChild(li);
            });

            // D. The "Smart" Logic: 50/30/20 Analysis
            const budgetNeeds = state.income * 0.50;
            const budgetWants = state.income * 0.30;
            const budgetSavings = state.income * 0.20;

            // Update Text Labels
            needsVal.textContent = `$${budgetNeeds.toFixed(0)}`;
            wantsVal.textContent = `$${budgetWants.toFixed(0)}`;
            savingsVal.textContent = `$${budgetSavings.toFixed(0)}`;

            // Update Visuals
            updateBar(needsBar, budgetNeeds, totalExpenses);
            updateBar(wantsBar, budgetWants, Math.max(0, totalExpenses - budgetNeeds));
            const remaining = state.income - totalExpenses;
            updateBar(savingsBar, budgetSavings, remaining, true);
        }

        function updateBar(element, limit, current, isReverse = false) {
            if (state.income === 0) {
                element.style.width = '0%';
                element.style.opacity = '0.3';
                return;
            }
            element.style.opacity = '1';
            let percentage = (current / state.income) * 100;
            element.style.width = `${Math.min(percentage, 100)}%`;

            if (current > limit && !isReverse) {
                element.style.background = 'var(--danger-color)';
            } else if (isReverse && current < 0) {
                element.style.background = 'var(--danger-color)';
            } else {
                // Reset to gradient via specific class logic or leave as is
                // For simplicity, we reset inline style if we changed it to red
                element.style.background = ''; 
            }
        }

        init();
// DOM ELEMENTS
const budgetInput = document.getElementById("budgetInput");
const saveBudgetBtn = document.getElementById("saveBudget");

const addExpenseBtn = document.getElementById("addExpense");

const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");

const expenseList = document.getElementById("expenseList");

const budgetDisplay = document.getElementById("budgetDisplay");
const expenseDisplay = document.getElementById("expenseDisplay");
const remainingDisplay = document.getElementById("remainingDisplay");
const largestExpenseDisplay = document.getElementById("largestExpense");

const progress = document.getElementById("progress");

const darkModeBtn = document.getElementById("darkModeBtn");
const exportBtn = document.getElementById("exportCSV");
const searchInput = document.getElementById("searchInput");

// DATA
let budget = Number(localStorage.getItem("budget")) || 0;
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

let chart;

// LOAD APP
loadApp();

function loadApp() {
    budgetDisplay.textContent = `₱${budget.toFixed(2)}`;
    renderExpenses();
    updateDashboard();
    createChart();
}

// SAVE BUDGET
saveBudgetBtn.addEventListener("click", () => {
    budget = Number(budgetInput.value);

    localStorage.setItem("budget", budget);

    budgetDisplay.textContent = `₱${budget.toFixed(2)}`;

    updateDashboard();
});

// ADD EXPENSE
addExpenseBtn.addEventListener("click", () => {

    const description = descriptionInput.value.trim();
    const category = categoryInput.value;
    const amount = Number(amountInput.value);
    const date = dateInput.value;

    if (!description || !amount || !date) {
        alert("Please complete all fields.");
        return;
    }

    const expense = {
        id: Date.now(),
        description,
        category,
        amount,
        date
    };

    expenses.push(expense);

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

    descriptionInput.value = "";
    amountInput.value = "";
    dateInput.value = "";

    renderExpenses();
    updateDashboard();
    updateChart();
});

// RENDER EXPENSES
function renderExpenses(filter = "") {

    expenseList.innerHTML = "";

    const filtered = expenses.filter(expense =>
        expense.description.toLowerCase()
        .includes(filter.toLowerCase())
    );

    filtered.forEach(expense => {

        const li = document.createElement("li");

        li.classList.add("expense-item");

        li.innerHTML = `
            <div class="expense-info">
                <strong>${expense.description}</strong>
                <small>
                    ${expense.category} |
                    ${expense.date}
                </small>
            </div>

            <div>
                ₱${expense.amount.toFixed(2)}

                <button
                    class="delete-btn"
                    onclick="deleteExpense(${expense.id})">
                    Delete
                </button>
            </div>
        `;

        expenseList.appendChild(li);
    });
}

// DELETE EXPENSE
function deleteExpense(id) {

    expenses = expenses.filter(
        expense => expense.id !== id
    );

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

    renderExpenses();
    updateDashboard();
    updateChart();
}

// DASHBOARD
function updateDashboard() {

    const totalExpenses =
        expenses.reduce(
            (total, expense) =>
            total + expense.amount,
            0
        );

    const remaining =
        budget - totalExpenses;

    expenseDisplay.textContent =
        `₱${totalExpenses.toFixed(2)}`;

    remainingDisplay.textContent =
        `₱${remaining.toFixed(2)}`;

    const largestExpense =
        expenses.length > 0
        ? Math.max(...expenses.map(e => e.amount))
        : 0;

    largestExpenseDisplay.textContent =
        `₱${largestExpense.toFixed(2)}`;

    let percent = 0;

    if (budget > 0) {
        percent =
            (totalExpenses / budget) * 100;
    }

    progress.style.width =
        `${Math.min(percent, 100)}%`;

    if (percent >= 100) {
        progress.style.background = "red";
    } else if (percent >= 80) {
        progress.style.background = "orange";
    } else {
        progress.style.background = "#4caf50";
    }
}

// DARK MODE
darkModeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark-mode")
    );
});

// LOAD DARK MODE
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
}

// SEARCH
searchInput.addEventListener("input", () => {
    renderExpenses(searchInput.value);
});

// CHART
function createChart() {

    const ctx =
        document.getElementById("expenseChart");

    chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: [],
            datasets: [{
                data: []
            }]
        },
        options: {
            responsive: true
        }
    });

    updateChart();
}

// UPDATE CHART
function updateChart() {

    const categories = {};

    expenses.forEach(expense => {

        if (!categories[expense.category]) {
            categories[expense.category] = 0;
        }

        categories[expense.category] +=
            expense.amount;
    });

    chart.data.labels =
        Object.keys(categories);

    chart.data.datasets[0].data =
        Object.values(categories);

    chart.update();
}

// EXPORT CSV
exportBtn.addEventListener("click", () => {

    let csv =
        "Description,Category,Amount,Date\n";

    expenses.forEach(expense => {

        csv +=
            `${expense.description},` +
            `${expense.category},` +
            `${expense.amount},` +
            `${expense.date}\n`;
    });

    const blob =
        new Blob([csv], {
            type: "text/csv"
        });

    const url =
        window.URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download = "expenses.csv";

    a.click();

    window.URL.revokeObjectURL(url);
});
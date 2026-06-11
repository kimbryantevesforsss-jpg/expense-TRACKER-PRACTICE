alert("JS LOADED");
// =========================
// TRACKMYPESO V2
// =========================

let income = Number(localStorage.getItem("income")) || 0;

let expenses =
    JSON.parse(
        localStorage.getItem("expenses")
    ) || [];

// ELEMENTS

const nicknameInput =
    document.getElementById("nicknameInput");

const saveNicknameBtn =
    document.getElementById("saveNicknameBtn");

const greetingText =
    document.getElementById("greetingText");

const currentDate =
    document.getElementById("currentDate");

const totalIncome =
    document.getElementById("totalIncome");

const totalExpenses =
    document.getElementById("totalExpenses");

const remainingBalance =
    document.getElementById("remainingBalance");

const incomeSource =
    document.getElementById("incomeSource");

const incomeAmount =
    document.getElementById("incomeAmount");

const addIncomeBtn =
    document.getElementById("addIncomeBtn");

const expenseName =
    document.getElementById("expenseName");

const expenseAmount =
    document.getElementById("expenseAmount");

const category =
    document.getElementById("category");

const addExpenseBtn =
    document.getElementById("addExpenseBtn");

const expenseList =
    document.getElementById("expenseList");

const searchInput =
    document.getElementById("searchInput");

const darkModeBtn =
    document.getElementById("darkModeBtn");

// =========================
// GREETING
// =========================

function updateGreeting() {

    const nickname =
        localStorage.getItem("nickname")
        || "User";

    const hour =
        new Date().getHours();

    let greeting = "";

    if (hour < 12) {
        greeting = "Good Morning";
    }
    else if (hour < 18) {
        greeting = "Good Afternoon";
    }
    else {
        greeting = "Good Evening";
    }

    greetingText.textContent =
        `${greeting}, ${nickname}! 👋`;

    currentDate.textContent =
        new Date().toLocaleDateString(
            "en-PH",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );
}

saveNicknameBtn.addEventListener(
    "click",
    () => {

        const nickname =
            nicknameInput.value.trim();

        if (!nickname) {
            alert("Please enter a nickname.");
            return;
        }

        localStorage.setItem(
            "nickname",
            nickname
        );

        nicknameInput.value = "";

        updateGreeting();
    }
);

// =========================
// INCOME
// =========================

addIncomeBtn.addEventListener(
    "click",
    () => {

        const amount =
            Number(incomeAmount.value);

        if (!amount) {
            alert("Enter income amount.");
            return;
        }

        income += amount;

        localStorage.setItem(
            "income",
            income
        );

        incomeSource.value = "";
        incomeAmount.value = "";

        updateDashboard();
    }
);

// =========================
// EXPENSES
// =========================

addExpenseBtn.addEventListener(
    "click",
    () => {

        const name =
            expenseName.value.trim();

        const amount =
            Number(expenseAmount.value);

        const selectedCategory =
            category.value;

        if (!name || !amount) {

            alert(
                "Please complete all fields."
            );

            return;
        }

        expenses.push({
            id: Date.now(),
            name,
            amount,
            category: selectedCategory
        });

        localStorage.setItem(
            "expenses",
            JSON.stringify(expenses)
        );

        expenseName.value = "";
        expenseAmount.value = "";

        renderExpenses();
        updateDashboard();
        updateChart();
    }
);

// =========================
// RENDER EXPENSES
// =========================

function renderExpenses(
    filter = ""
) {

    expenseList.innerHTML = "";

    expenses
        .filter(expense =>
            expense.name
                .toLowerCase()
                .includes(
                    filter.toLowerCase()
                )
        )
        .forEach(expense => {

            const li =
                document.createElement("li");

            li.innerHTML = `
                <span>
                    ${expense.category}
                    •
                    ${expense.name}
                    •
                    ₱${expense.amount}
                </span>

                <button
                    onclick="deleteExpense(${expense.id})">
                    Delete
                </button>
            `;

            expenseList.appendChild(li);
        });
}

// =========================
// DELETE
// =========================

function deleteExpense(id) {

    expenses =
        expenses.filter(
            expense =>
                expense.id !== id
        );

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

    renderExpenses();
    updateDashboard();
    updateChart();
}

window.deleteExpense =
    deleteExpense;

// =========================
// DASHBOARD
// =========================

function updateDashboard() {

    const expenseTotal =
        expenses.reduce(
            (sum, expense) =>
                sum + expense.amount,
            0
        );

    totalIncome.textContent =
        `₱${income.toFixed(2)}`;

    totalExpenses.textContent =
        `₱${expenseTotal.toFixed(2)}`;

    remainingBalance.textContent =
        `₱${(
            income -
            expenseTotal
        ).toFixed(2)}`;
}

// =========================
// SEARCH
// =========================

searchInput.addEventListener(
    "input",
    () => {

        renderExpenses(
            searchInput.value
        );
    }
);

// =========================
// DARK MODE
// =========================

darkModeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark-mode"
        );

        localStorage.setItem(
            "darkMode",
            document.body.classList.contains(
                "dark-mode"
            )
        );
    }
);

if (
    localStorage.getItem(
        "darkMode"
    ) === "true"
) {
    document.body.classList.add(
        "dark-mode"
    );
}

// =========================
// PIE CHART
// =========================

const chartContext =
    document
        .getElementById("expenseChart")
        .getContext("2d");

const expenseChart =
    new Chart(chartContext, {
        type: "pie",
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    "#22C55E",
                    "#3B82F6",
                    "#F59E0B",
                    "#EF4444",
                    "#8B5CF6",
                    "#06B6D4"
                ]
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });

function updateChart() {

    const totals = {
        Food: 0,
        Transport: 0,
        Bills: 0,
        Shopping: 0,
        Entertainment: 0,
        Other: 0
    };

    expenses.forEach(expense => {

        totals[
            expense.category
        ] += expense.amount;
    });

    expenseChart.data.labels =
        Object.keys(totals);

    expenseChart.data.datasets[0].data =
        Object.values(totals);

    expenseChart.update();
}

// =========================
// START APP
// =========================

updateGreeting();
renderExpenses();
updateDashboard();
updateChart();

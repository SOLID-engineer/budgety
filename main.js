let currentId = 2;
let total = 0;
let totalIncome = 0;
let totalExpenses = 0;

(function() {
  if (document.querySelector("div.budget__value").innerText.includes("+")) {
    total = parseFloat(document.querySelector("div.budget__value").innerText.replace("+ $", ""));
  } else {
    total = 0 - parseFloat(document.querySelector("div.budget__value").innerText.replace("- $", ""));
  }

  if (document.querySelector("div.budget__income--value").innerText.includes("+")) {
    totalIncome = parseFloat(document.querySelector("div.budget__income--value").innerText.replace("+ $", ""));
  } else {
    totalIncome = 0 - parseFloat(document.querySelector("div.budget__income--value").innerText.replace("- $", ""));
  }

  if (document.querySelector("div.budget__expenses--value").innerText.includes("+")) {
    totalExpenses = parseFloat(document.querySelector("div.budget__expenses--value").innerText.replace("+ $", ""));
  } else {
    totalExpenses = 0 - parseFloat(document.querySelector("div.budget__expenses--value").innerText.replace("- $", ""));
  }

}())

class TransactionList {
  constructor(id) {
    this.id = id;
    this.incomeList = [];
    this.expenseList = [];
  }

  updateIncomeHTML = () => {
    document.querySelector("div.budget__income--value").innerText = `+ $${Math.abs(totalIncome.toFixed(2))}`
  }

  updateExpensesHTML = (type) => {
    document.querySelector("div.budget__expenses--value").innerText = `- $${Math.abs(totalExpenses.toFixed(2))}`
  }

  updateTotalHTML = () => {
    if ((totalIncome - Math.abs(totalExpenses)) >= 0) {
      return document.querySelector("div.budget__value").innerText = `+ $${Math.abs(total.toFixed(2))}`
    }
    return document.querySelector("div.budget__value").innerText = `- $${Math.abs(total.toFixed(2))}`
  }

  updateTotalExpensesPercentage = () => {
    if (total > 0) {
      const totalExpensesPercentage = (totalExpenses / total * 100).toFixed(0);
      document.querySelector("div.budget__expenses--percentage").innerText = `${totalExpensesPercentage}%`;

      const expensesItems = document.querySelector("div.expenses__list").children;
      Array.from(expensesItems).map(item => {
        const itemCurrentValue = item.querySelector("div.item__value").innerText.replace("- $", "")
        const itemCurrentPercentage = (itemCurrentValue / total * 100).toFixed(0);
        item.querySelector("div.item__percentage").innerText = `-${itemCurrentPercentage}%`;
      })
    } else {
      document.querySelector("div.budget__expenses--percentage").innerText = "0%";
    }
  }

  addNewTransaction = (transaction) => {
    const data = {
      id: transaction.id,
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date
    }

    const amount = parseFloat(transaction.amount);
    total += amount;

    if (amount >= 0 || (amount < 0 && total > 0)) {
      if (amount >= 0) {
        totalIncome += amount;
        this.updateIncomeHTML();
      } else {
        totalExpenses += amount;
        this.updateExpensesHTML();
      }

      this.updateTotalExpensesPercentage();
      this.updateTotalHTML();

      return this.incomeList = [...this.incomeList, data]
    }

    if (amount <= 0) {
      totalExpenses += amount;
      this.updateExpensesHTML();
      this.updateTotalExpensesPercentage();
      this.updateTotalHTML();
    }

    document.querySelector("div.budget__value").innerText = `- $${Math.abs(total.toFixed(2))}`

    return this.expenseList = [...this.expenseList, data]
  }

  removeTransaction = (id, type) => {
    const transactionRemoved = document.querySelector(`div[data-transaction-id="${id}"]`)

    const transactionRemovedValue = transactionRemoved.querySelector("div.item__value").innerText.replace("+ $", "").replace("- $", "");

    if (type === 'income') {
      this.incomeList = this.incomeList.filter(income => income.id !== id)

      total -= parseFloat(transactionRemovedValue);
      totalIncome -= parseFloat(transactionRemovedValue);
      this.updateTotalExpensesPercentage();
      this.updateIncomeHTML()

      const incomeListHTML = document.querySelector("div.income__list");
      incomeListHTML.removeChild(transactionRemoved);
    } else {
      this.expenseList = this.expenseList.filter(income => income.id !== id)

      total += parseFloat(transactionRemovedValue);
      totalExpenses += parseFloat(transactionRemovedValue);
      this.updateTotalExpensesPercentage();
      this.updateExpensesHTML()

      const expenseListHTML = document.querySelector("div.expenses__list");
      expenseListHTML.removeChild(transactionRemoved);
    }
    this.updateTotalHTML();
  }

  displayTransaction = (transaction) => {
    let listDisplay;

    // create html tags
    const item = document.createElement("div");
    item.className = "item";
    item.setAttribute("data-transaction-id", transaction.id);

    const itemDescription = document.createElement("div");
    itemDescription.className = "item__description";
    itemDescription.innerText = transaction.description;

    const itemRight = document.createElement("div");
    itemRight.className = "right";

    const itemDate = document.createElement("div");
    itemDate.className = "item__date";
    itemDate.innerText = window.moment(transaction.date).format("MMM. Do YYYY")

    const itemValue = document.createElement("div");
    itemValue.className = "item__value";

    const itemPercentage = document.createElement("div");
    itemPercentage.className = "item__percentage";
    if (total > 0) {
      itemPercentage.innerText = `${parseFloat(transaction.amount / total.toFixed(0) * 100).toFixed(0)}%`
    } else {
      itemPercentage.innerText = "0%";
    }

    const itemDelete = document.createElement("div");
    itemDescription.className = "item__delete";

    const buttonDelete = document.createElement("button");
    buttonDelete.className = "item__delete--btn";

    const iconDelete = document.createElement("i");
    iconDelete.className = "ion-ios-close-outline";

    buttonDelete.appendChild(iconDelete);
    itemDelete.appendChild(buttonDelete);
    itemRight.appendChild(itemValue);
    item.appendChild(itemDescription);
    item.appendChild(itemRight);
    item.appendChild(itemDate);

    if ((parseFloat(transaction.amount)) > 0) {
      itemRight.appendChild(itemDelete);
      listDisplay = document.querySelector("div.income__list");
      itemValue.innerText = `+ $${transaction.amount}`
      itemDelete.setAttribute("onclick", `deleteTransaction(${transaction.id}, 'income')`);
    } else {
      itemRight.appendChild(itemPercentage);
      itemRight.appendChild(itemDelete);
      listDisplay = document.querySelector("div.expenses__list");
      itemValue.innerText = `- $${Math.abs(transaction.amount)}`
      itemDelete.setAttribute("onclick", `deleteTransaction(${transaction.id}, 'expenses')`);
    }

    listDisplay.insertBefore(item, listDisplay.childNodes[0]);
  }


}

class Transaction {
  constructor(id, description, amount, date) {
    this.id = id;
    this.description = description;
    this.amount = amount;
    this.date = date;
  }
}

const transactionList = new TransactionList();

function submitValue() {
  const description = document.querySelector("input.add__description").value;
  const value = document.querySelector("input.add__value").value;
  if ((description.length && value.length) > 0) {
    const transaction = new Transaction(currentId + 1, description, value, Date.now());
    transactionList.addNewTransaction(transaction)
    transactionList.displayTransaction(transaction);
    currentId += 1;
    document.querySelector("input.add__description").value = "";
    document.querySelector("input.add__value").value = "";
  }
}

function deleteTransaction(id, type) {
  transactionList.removeTransaction(id, type);
}



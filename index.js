const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');



const program = new Command();
const expenseFile = path.join(__dirname, 'expenselist.json')



program
    .name('expense-tracker')
    .description('CLI to track your expenses')
    .version('0.8.0');

program
    .command('add')
    .description('Add an expense')
    .requiredOption('--description <desc>', 'description')
    .requiredOption('--amount <amount>', 'amount')
    .action((options) => {
        const { description, amount } = options
        if (!description || !amount) {
            console.log("Description and amount are required.")
            process.exit(1)
        } else if (amount < 0) {
            console.log("Expense amount must be positive number.")
            process.exit(1)
        } else {
            // logic for adding expense
            try {
                let expenses = [];
                if (fs.existsSync(expenseFile)) {
                    const fileContent = fs.readFileSync(expenseFile, 'utf-8');
                    if (fileContent.trim() !== '') {
                        try {
                            expenses = JSON.parse(fileContent);
                        } catch (parseError) {
                            console.error("Error parsing JSON file:", parseError.message);
                            console.log("Creating a new expense list.");
                        }
                    }
                }
                const date = new Date().toISOString().split('T')[0];
                const newExpense = {
                    "id": uuidv4(),
                    "description": description,
                    "amount": parseFloat(amount),
                    "date": date
                };
                expenses.push(newExpense);
                fs.writeFileSync(expenseFile, JSON.stringify(expenses, null, 2));
                console.log("New expense added successfully.");
            } catch (error) {
                console.error("An error occurred while adding the expense:", error.message);
                process.exit(1);
            }
        }
    });

// Command to list all the expenses
program
    .command('list')
    .description('List all expenses')
    .action(() => {
        try {
            if (!fs.existsSync(expenseFile)) {
                console.log("No expenses found.");
                return;
            }
            const expenses = JSON.parse(fs.readFileSync(expenseFile, 'utf-8'));
            if (expenses.length === 0) {
                console.log("No expenses found.");
            } else {
                console.log("#\tDate\t\tDescription\t\tAmount")
                expenses.forEach((expense, index) => {
                    console.log(`#${index + 1}.  \t${expense.date} \t\t${expense.description} \t\t${expense.amount}$`);
                });
            }
        } catch (error) {
            console.error("An error occurred while listing the expenses:", error.message);
            process.exit(1);
        }
    })

// Command to delete expenses by id
program
    .command('delete')
    .description('Delete an expense by id')
    .requiredOption("--id <id>", "Id which you want to delete")
    .action((options) => {
        const { id } = options;
        try {
            if (!fs.existsSync(expenseFile)) {
                console.log("No expenses found.");
                return;
            }
            let expenses = JSON.parse(fs.readFileSync(expenseFile, 'utf-8'));
            const expenseIndex = expenses.findIndex(expense => expense.id === id);
            if (expenseIndex === -1) {
                console.log("Expense with the given id not found.");
            } else {
                const deletedExpense = expenses.splice(expenseIndex, 1);
                fs.writeFileSync(expenseFile, JSON.stringify(expenses, null, 2));
                console.log("Expense deleted successfully.");
            }
        } catch (error) {
            console.error("An error occurred while deleting the expense:", error.message);
            process.exit(1);
        }
    });

// Users can view a summary of all expenses.
// Users can view a summary of expenses for a specific month (of current year).

program
    .command('summary')
    .description('View summary of all expenses')
    .option("--month <month>", "Enter month in numbers (1 to 12)")
    .action((options) => {
        const { month } = options;
        try {
            if (!fs.existsSync(expenseFile)) {
                console.log("No expenses found.");
                return;
            }
            const expenses = JSON.parse(fs.readFileSync(expenseFile, 'utf-8'));
            const summary = expenses.reduce((acc, expense) => {
                const expenseMonth = expense.date.split('-')[1];
                if (expenseMonth === month) {
                    acc[month] = (acc[month] || 0) + expense.amount;
                }
                return acc;
            }, {});
            console.log("Summary of all expenses for the month of " + month + ":");
            console.log(summary);
            console.log("Total expenses for the month of " + month + ": " + summary[month]);
        } catch (error) {
            console.error("An error occurred while viewing the summary:", error.message);
            process.exit(1);
        }

    })


program.parse();
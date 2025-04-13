class Transaction {
    static route = API.URL + 'transactions';

    constructor(id, name, amount, repeats, repeatsOn, date) {
        this.id = id;
        this.amount = amount;
        this.date = date;
        this.name = name;
        this.repeats = repeats;
        this.repeatsOn = repeatsOn;
        this.startsOn = date;

        if (amount < 0)
            this.type = "expense";
        else
            this.type = "income";
    }

    displayDate() {
        return moment(this.date).format("M-D-YYYY");
    }

    isDateValid() {
        var currentDate = new Date();
        var transactionDate = new Date(this.date);
        return transactionDate.getMonth() === currentDate.getMonth() && transactionDate >= currentDate;
    }

    html() {
        return `
            <div class="transaction ${this.type}" data-id="${this.id}" data-repeats="${this.repeats}" data-repeats-on="${this.repeatsOn}" data-date="${this.date}">
                <div class="transaction-date">${this.displayDate()}</div>
                <div class="transaction-details">
                    <div class="transaction-name">${this.name}</div>
                    <div class="transaction-amount">${this.amount}</div>
                </div>
            </div>
        `;
    }

    json() {
        return {
            Name: this.name,
            Amount: this.amount,
            Repeats: this.repeats,
            RepeatsOn: this.repeatsOn,
            Date: this.startsOn
        };
    }

    static getAll(successCallback, errorCallback) {
        $.ajax({
            url: Transaction.route,
            method: 'GET',
            success: function(data) {
                // id, name, amount, repeats, repeatsOn, date
                var transactions = data.map(function(transactionData) {
                    return new Transaction(
                        transactionData._id,
                        transactionData.Name,
                        transactionData.Amount,
                        transactionData.Repeats,
                        transactionData.RepeatsOn,
                        transactionData.Date
                    );
                });

                successCallback(transactions);                
            },
            error: function(error) {
                console.error('Error fetching transactions: ', error);
                errorCallback(error);
            }
        });
    }

    static processTransactions(transactions) {
        // Update transaction dates for current month and year, filter out past transactions and those not in the current month, sort by date
        var processedTransactions = [];

        transactions.forEach(function(transaction) {
            // If the transaction repeats weekly, determine which dates will occur within the current month            
            if (transaction.repeats === "Weekly") {
                var currentDate = new Date();
                var lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                var startDate = new Date(transaction.date);
                var repeatDay = startDate.getDay();
                var repeatInterval = parseInt(transaction.repeatsOn);

                var dates = [];

                var intervalDate = startDate;
                while (intervalDate <= lastDayOfMonth) {
                    if (intervalDate >= currentDate) {
                        dates.push(intervalDate.toISOString().split('T')[0]);
                    }
                    intervalDate.setDate(intervalDate.getDate() + repeatInterval * 7);
                }

                // If valid dates, add them to the processed transactions to be returned
                if (dates != []) {
                    // Set the date of the current transaction object to the first valid date (keep the starting date)
                    var startingDate = transaction.date;

                    // If there are multiple valid dates, create a new transaction object for each date
                    for (var i = 0; i < dates.length; i++) {
                        var newTransaction = new Transaction(transaction.id, transaction.name, transaction.amount, transaction.repeats, transaction.repeatsOn, dates[i]);
                        newTransaction.startsOn = startingDate; // Set the starting date to the original transaction date
                        
                        // If the date for the transaction falls within the current month and is not in the past, add it to the processed transactions to be returned
                        if (newTransaction.isDateValid())
                            processedTransactions.push(newTransaction);
                    }
                }
            }

            // If the transaction is monthly, update the date to the corresponding day of the current month
            if (transaction.repeats === "Monthly") {
                transaction.startsOn = transaction.date;
                transaction.date = new Date(new Date().getFullYear(), new Date().getMonth(), transaction.repeatsOn);

                // If the date for the transaction falls within the current month and is not in the past, add it to the processed transactions to be returned
                if (transaction.isDateValid())
                    processedTransactions.push(transaction);
            }
        });
        
        processedTransactions.sort(function(a, b) {
            return new Date(a.date) - new Date(b.date);
        });

        return processedTransactions;
    }
}
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
        var currentDate = moment();
        var transactionDate = moment(this.date);
        return transactionDate.month() === currentDate.month() && transactionDate >= currentDate;
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
                var currentDate = moment();
                var lastDayOfMonth = moment().endOf('month');
                var startDate = moment(transaction.date);
                var repeatInterval = parseInt(transaction.repeatsOn);

                var dates = [];

                var intervalDate = startDate.clone();              
                while (intervalDate <= lastDayOfMonth) {
                    if (intervalDate >= currentDate) {
                        dates.push(intervalDate.clone());
                    }
                    intervalDate = intervalDate.add(repeatInterval, 'w');
                }

                // If valid dates, add them to the processed transactions to be returned
                if (dates != []) {
                    // Keep the original date from the db as the starting date
                    var startingDate = transaction.date;

                    // Add each valid date to the array of processed transactions
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
                transaction.date = moment().date(transaction.repeatsOn);

                // If the date for the transaction falls within the current month and is not in the past, add it to the processed transactions to be returned
                if (transaction.isDateValid())
                    processedTransactions.push(transaction);
            }
        });
        
        processedTransactions.sort(function(a, b) {
            return moment(a.date) - moment(b.date);
        });

        return processedTransactions;
    }
}
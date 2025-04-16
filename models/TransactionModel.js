class Transaction {
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

    json() {
        return {
            Name: this.name,
            Amount: this.amount,
            Repeats: this.repeats,
            RepeatsOn: this.repeatsOn,
            Date: this.startsOn
        };
    }
}

class TransactionModel {
    constructor() {
        this.route = API.URL + 'transactions';
        this.transactions = [];
        this.processedTransactions = [];
        this.dateMonth = moment().month();
        this.dateYear = moment().year();
        this.observers = [];
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notifyObservers() {
        this.observers.forEach(observer => observer.update(this.processedTransactions));
    }

    isDateValid(transaction) {
        var currentDate = moment();
        var transactionDate = moment(transaction.date);
        return transactionDate.month() === this.dateMonth && transactionDate >= currentDate;
    }

    // Process transactions based on selected month and day
    processTransactions() {
        // Clear currently processed transactions
        this.processedTransactions = [];
        
        // Update transaction dates for current month and year, filter out past transactions and those not in the current month, sort by date
        this.transactions.forEach((transaction) => {
            // If the transaction is not set to repeat, check if the date is valid and add it to the processed transactions to be returned
            if (transaction.repeats === "None") {
                // If the date for the transaction falls within the current month and is not in the past, add it to the processed transactions to be returned
                if (this.isDateValid(transaction))
                    this.processedTransactions.push(transaction);
            }

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
                        if (this.isDateValid(newTransaction))
                            this.processedTransactions.push(newTransaction);
                    }
                }
            }

            // If the transaction is monthly, update the date to the corresponding day of the current month
            if (transaction.repeats === "Monthly") {
                transaction.startsOn = transaction.date;
                transaction.date = moment().year(this.dateYear).month(this.dateMonth).date(transaction.repeatsOn);

                // If the date for the transaction falls within the current month and is not in the past, add it to the processed transactions to be returned
                if (this.isDateValid(transaction))
                    this.processedTransactions.push(transaction);
            }
        });
        
        this.processedTransactions.sort(function(a, b) {
            return moment(a.date) - moment(b.date);
        });
    }

    changeDate(month, year) {
        this.dateMonth = month;
        this.dateYear = year;

        // Process transactions based on the new date
        this.processTransactions();
        this.notifyObservers();
    }

    getAll(errorCallback) {
        $.ajax({
            url: this.route,
            method: 'GET',
            context: this,
            success: function(data) {
                // id, name, amount, repeats, repeatsOn, date
                this.transactions = data.map(function(transactionData) {
                    return new Transaction(
                        transactionData._id,
                        transactionData.Name,
                        transactionData.Amount,
                        transactionData.Repeats,
                        transactionData.RepeatsOn,
                        transactionData.Date
                    );
                });

                this.processTransactions();
                this.notifyObservers();                
            },
            error: function(error) {
                console.error('Error fetching transactions: ', error);
                errorCallback(error);
            }
        });
    }
}
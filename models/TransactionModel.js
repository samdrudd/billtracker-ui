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

    displayStartDate() {
        return moment(this.startsOn).format("M-D-YYYY");
    }

    displayAmount() {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2
          }).format(this.amount);
    }

    displayRepeats() {
        if (this.repeats !== "None") {
            if (this.repeats === "Weekly") {
                if (this.repeatsOn === 1)
                    return `<div>Repeats once a week starting on ${this.displayStartDate()}</div>`;
                else if (this.repeatsOn > 1)
                    return `<div>Repeats once every ${this.repeatsOn} weeks starting on ${this.displayStartDate()}</div>`;
            }
            if (this.repeats === "Monthly")
                return `<div>Repeats on day ${this.repeatsOn} of each month starting on ${this.displayStartDate()}</div>`;
        }
        return "<div>Does not repeat</div>";
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
        this.selectedTransaction = null;
        this.listObservers = [];
        this.singleObservers = [];
    }

    addListObserver(observer) {
        this.listObservers.push(observer);
    }

    removeListObserver(observer) {
        this.listObservers = this.observers.filter(obs => obs !== observer);
    }

    notifyListObservers() {
        this.listObservers.forEach(observer => observer.update(this.processedTransactions));
    }

    addSingleObserver(observer) {
        this.singleObservers.push(observer);
    }

    removeSingleObserver(observer) {
        this.singleObservers = this.observers.filter(obs => obs !== observer);
    }

    notifySingleObservers() {
        this.singleObservers.forEach(observer => observer.update(this.selectedTransaction));
    }

    notifyAllObservers() {
        this.notifyListObservers();
        this.notifySingleObservers();
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
                var lastDayOfMonth = moment().year(this.dateYear).month(this.dateMonth).endOf('month');
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
                    var startingDate = transaction.startsOn;

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
        this.notifyListObservers();
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
                this.notifyListObservers();                
            },
            error: function(error) {
                console.error('Error fetching transactions: ', error);
                errorCallback(error);
            }
        });
    }

    // Select a transaction from processed transaction by ID
    selectTransaction(transactionId) {
        this.selectedTransaction = this.processedTransactions.find(transaction => transaction.id === transactionId);
        this.notifySingleObservers();
    }
}
class TransactionListView {
    constructor(containerElementId) {
        this.containerElementId = containerElementId;
    }

    // Process transactions based on current month and day
    processTransactions(transactions) {
        // Update transaction dates for current month and year, filter out past transactions and those not in the current month, sort by date
        var processedTransactions = [];

        transactions.forEach(function(transaction) {
            // If the transaction is not set to repeat, check if the date is valid and add it to the processed transactions to be returned
            if (transaction.repeats === "None") {
                // If the date for the transaction falls within the current month and is not in the past, add it to the processed transactions to be returned
                if (transaction.isDateValid())
                    processedTransactions.push(transaction);
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

    renderTransactionList(transactions) {   
        $(`#${this.containerElementId}`).empty(); // Clear the container

        transactions = this.processTransactions(transactions); // Process transactions to get valid dates

        transactions.forEach(transaction => {
            const transactionElement = 
            `
                <div class="transaction ${transaction.type}" data-id="${transaction.id}" data-repeats="${transaction.repeats}" data-repeats-on="${transaction.repeatsOn}" data-date="${transaction.date}">
                    <div class="transaction-date">${transaction.displayDate()}</div>
                    <div class="transaction-details">
                        <div class="transaction-name">${transaction.name}</div>
                        <div class="transaction-amount">${transaction.amount}</div>
                    </div>
                </div>
            `;
            $(`#${this.containerElementId}`).append(transactionElement);
        });
    }

    update(transactions) {
        this.renderTransactionList(transactions);
    }
}
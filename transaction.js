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
}

const TransactionController = {
    getAll: function(successCallback, errorCallback) {
        $.ajax({
            url: API.URL + 'transactions',
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
}
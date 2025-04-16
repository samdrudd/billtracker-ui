class TransactionListView {
    constructor(containerElementId) {
        this.containerElementId = containerElementId;
    }

    renderTransactionList(transactions) {   
        $(`#${this.containerElementId}`).empty(); // Clear the container

        transactions.forEach(transaction => {
            const transactionElement = 
            `
                <div class="transaction ${transaction.type}" data-id="${transaction.id}" data-repeats="${transaction.repeats}" data-repeats-on="${transaction.repeatsOn}" data-date="${transaction.date}" onClick="selectTransaction('${transaction.id}')">
                    <div class="transaction-date">${transaction.displayDate()}</div>
                    <div class="transaction-details">
                        <div class="transaction-name">${transaction.name}</div>
                        <div class="transaction-amount">${transaction.displayAmount()}</div>
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
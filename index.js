window.onload = function () {
  Array.from(document.getElementsByClassName("donation")).forEach(element => {
    element.addEventListener("change", calculate);
  });
  Array.from(document.getElementsByClassName("paid")).forEach(element => {
    element.addEventListener("change", calculate);
  });
  document.getElementById("count").addEventListener("change", calculate);
}

function addDonation() {
  const donationDiv = document.getElementById("donation");
  const div = document.createElement("div");
  var newDonation = document.createElement("input");
  newDonation.className = "donation";
  newDonation.type = "number";
  newDonation.placeholder = "寄付金額を入力"
  newDonation.addEventListener("change", calculate);

  donationDiv.appendChild(div);
  donationDiv.appendChild(newDonation);
}

function addPaid() {
  const paidDiv = document.getElementById("paid");
  const div = document.createElement("div");
  var newPaid = document.createElement("input");
  newPaid.className = "paid";
  newPaid.type = "number";
  newPaid.placeholder = "支払済みの金額を入力"
  newPaid.addEventListener("change", calculate);

  paidDiv.appendChild(div);
  paidDiv.appendChild(newPaid);
}

class Person {
  constructor(id, pay, paid) {
    this.id = paid + "円(" + id + ")";
    this.pay = pay;
    this.paid = paid;
  }
}

function calculate() {
  const donations = document.getElementsByClassName("donation");
  const paids = document.getElementsByClassName("paid");
  const count = parseInt(document.getElementById("count").value);
  var sumDonation = 0;
  var sumPaid = 0;
  var paidList = [];

  if (paids.length > count) {
    document.getElementById("result").innerHTML = "割り付け人数不足";
    return;
  }

  for (var i = 0; i < donations.length; i++) {
    const value = parseInt(donations[i].value);
    if (!isNaN(value)) {
      sumDonation += value;
    }
  }

  for (var i = 0; i < paids.length; i++) {
    const value = parseInt(paids[i].value);
    if (!isNaN(value)) {
      sumPaid += value;
      paidList.push(value);
    }
  }
  paidList.sort((a, b) => b - a);

  const totalCost = sumPaid - sumDonation;
  const perPerson = totalCost / count;

  var personList = [new Person("寄付", sumDonation, 0)];
  for (var i = 0; i < count; i++) {
    personList.push(new Person(i, perPerson, i < paidList.length ? paidList[i] : 0));
  }

  // 自身の分は相殺
  for (var i = 0; i < personList.length; i++) {
    var person = personList[i];
    if (person.pay > person.paid) {
      person.pay -= person.paid;
      person.paid = 0;
    } else {
      person.paid -= person.pay;
      person.pay = 0;
    }
  }

  var payList = [];
  for (i = 0; i < 10000; i++) {
    var maxPaidPerson = personList.reduce((a, b) => a.paid >= b.paid ? a : b);
    if (maxPaidPerson.paid <= 0) { break; }
    var minPaidPerson = personList.reduce((a, b) => a.paid <= b.paid && a.pay > 0 ? a : b);

    // minPaidPerson が maxPaidPerson に支払う
    if (maxPaidPerson.paid > minPaidPerson.pay) {
      payList.push({ from: minPaidPerson, to: maxPaidPerson, amount: minPaidPerson.pay });
      maxPaidPerson.paid -= minPaidPerson.pay;
      minPaidPerson.pay = 0;
    } else {
      payList.push({ from: minPaidPerson, to: maxPaidPerson, amount: maxPaidPerson.paid });
      minPaidPerson.pay -= maxPaidPerson.paid;
      maxPaidPerson.paid = 0;
    }
  }
  // paylist を id 順に並べる
  payList.sort((a, b) => a.from.id - b.from.id);

  var resultStr = "";
  resultStr += "支払い総額: " + sumPaid + "円<br>";
  resultStr += "寄付金額: " + sumDonation + "円<br>";
  resultStr += "残額: " + totalCost + "円<br>";
  resultStr += "1人当たり: " + perPerson + "円<br>";
  resultStr += "<br>";
  resultStr += `
    <table>
      <thead>
        <tr>
          <th scope="col">From</th>
          <th scope="col">To</th>
          <th scope="col">Amount</th>
        </tr>
      </thead>
      <tbody>
    `;
  var lastFromId = "";
  payList.forEach(pay => {
    if (pay.from != pay.to && pay.amount != 0) {
      const isNewSection = pay.from.id !== lastFromId;
      resultStr += `<tr><td${isNewSection ? ' class="new-section"' : ''}>${pay.from.id}</td><td${isNewSection ? ' class="new-section"' : ''}>${pay.to.id}</td><td${isNewSection ? ' class="new-section"' : ''}>${pay.amount}</td></tr>`;
      lastFromId = pay.from.id;
    }
  });
  resultStr += `
      </tbody>
    </table>
    `;
  document.getElementById("result").innerHTML = resultStr;
}

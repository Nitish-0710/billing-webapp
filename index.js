let addRow = document.querySelector("#addRow");
let table = document.querySelector("#billTable");
let tableHead = document.querySelector("#billTableHead");
let tablebody = document.querySelector("#billTableBody");
let tablefoot = document.querySelector("#billTableFoot");

let totalCheckbox = document.querySelector("#totalCheckbox");
let advanceCheckbox = document.querySelector("#advanceCheckbox");

let companyLetterHead = document.querySelector(".company-letter-head");

let addGstBtn = document.querySelector("#add-gst");

let gst = document.querySelector("#add-gst");

document.getElementById("date").valueAsDate = new Date();

function tableRow() {
    let tr = document.createElement("tr");
    for (let i = 0; i < 6; i++) {
        let td = document.createElement("td");
        td.setAttribute(
            "class",
            `${table.tHead.rows[0].cells[i].innerText
                .toLowerCase()
                .replace(" ", "-")}-td_desc`
        );
        let textarea = document.createElement("textarea");
        textarea.setAttribute(
            "class",
            `${table.tHead.rows[0].cells[i].innerText
                .toLowerCase()
                .replace(" ", "-")} form-control text-area`
        );
        textarea.setAttribute("rows", "1");
        textarea.addEventListener("input", () => {
            textareaHeight(textarea);
        });
        td.appendChild(textarea);
        tr.appendChild(td);
    }
    let rembtn = removeRow();
    tr.appendChild(rembtn);
    return tr;
}

addRow.addEventListener("click", () => {
    let body_row = tableRow();
    tablebody.appendChild(body_row);
    srNo();
});

let pr = document.getElementById("print");

pr.addEventListener("click", () => {
    Array.from(document.querySelectorAll(".btn")).forEach((button) => {
        button.parentElement.setAttribute("hidden", "true");
    });
    // document.getElementsByTagName("nav").setAttribute("hidden", "true")

    window.print();
    Array.from(document.querySelectorAll(".btn")).forEach((button) => {
        button.parentElement.removeAttribute("hidden");
    });
    // document.getElementsByTagName("nav").removeAttribute("hidden");
});

tablebody.addEventListener("input", (e) => {
    let target = e.target;
    if (
        target.classList.contains("quantity") ||
        target.classList.contains("rate")
    ) {
        let row = target.closest("tr");
        let qty = row.querySelector(".quantity").value;
        let rate = row.querySelector(".rate").value;
        let amount = qty * rate;
        row.querySelector(".amount-rs").value = amount;
        row.querySelector(".amount-rs").style.height = "20px";
    }
    total();
    if (document.getElementsByClassName("advance")) {
        advance();
    }
    if (!isNaN(gst.value)) {
        console.log(gst.value);
        calculateGST(Number.parseInt(gst.value));
    }
});

function saveData() {
    let rows = [];
    let trs = tablebody.querySelectorAll("tr");
    Array.from(trs).forEach((tr) => {
        let row = {};
        row.sr_no = tr.querySelector(".sr-no-td_desc").innerText;
        row.description = tr.querySelector(".description").value;
        row.quantity = tr.querySelector(".quantity").value;
        row.unit = tr.querySelector(".unit").value;
        row.rate = tr.querySelector(".rate").value;
        row.amount_rs = tr.querySelector(".amount-rs").value;
        rows.push(row);
    });
    localStorage.setItem("billData", JSON.stringify(rows));
}

let saveBtn = document.querySelector("#saveBtn");
saveBtn.addEventListener("click", saveData);

function removeRow() {
    let td_desc = document.createElement("td");
    let button = document.createElement("button");
    button.append("⛔");
    button.setAttribute(
        "class",
        "btn btn-primary btn-sm rounded-circle px-1 py-1"
    );
    td_desc.appendChild(button);
    button.addEventListener("click", () => {
        let tr = button.closest("tr");
        tr.remove();
        srNo();
        total();
        if (document.getElementsByClassName("advance")) {
            advance();
        }
        
        if (!isNaN(gst.value)) {
            calculateGST(Number.parseInt(gst.value));
        }
    });
    return td_desc;
}

function srNo() {
    for (let i = 0; i < tablebody.rows.length; i++) {
        tablebody.rows[i].cells[0].innerHTML = `${i + 1}`;
    }
}

let resetBtn = document.querySelector("#resetBtn");
resetBtn.addEventListener("click", () => {
    Array.from(document.querySelectorAll(".text-area")).forEach((textarea) => {
        textarea.value = "";
    });
});

function textareaHeight(textarea) {
    textarea.style.height = "20px";
    textarea.style.height = textarea.scrollHeight + "px";
}

let r_textarea = document.getElementById("reciever-add");
r_textarea.addEventListener("input", () => {
    textareaHeight(r_textarea);
});

totalCheckbox.addEventListener("click", () => {
    if (!document.querySelector(".total")) {
        for (let i = 0; i < 3; i++) {
            let totalAmount_tr = document.createElement("tr");
            let totalAmount_desc = addFootRowDesc(
                "total total-amount-desc tfoot"
            );
            let totalAmount_amt = addFootRowAmount(
                "total total-amount-rs tfoot"
            );

            totalAmount_tr.appendChild(totalAmount_desc);
            totalAmount_tr.appendChild(totalAmount_amt);

            let remBtn = removeRow();
            totalAmount_tr.appendChild(remBtn);
            tablefoot.insertAdjacentElement("afterbegin", totalAmount_tr);
        }
    }
    total();
    if (document.querySelector(".balance")) {
        advance();
    }
    document.querySelector("#add-gst").removeAttribute("disabled");
});

advanceCheckbox.addEventListener("click", () => {
    if (!document.querySelector(".advance")) {
        let advance_tr = document.createElement("tr");
        advance_tr.setAttribute("class", "advance-tr");
        let advance_desc = addFootRowDesc("advance advance-desc tfoot");
        let advance_amt = addFootRowAmount("advance advance-rs tfoot");

        advance_tr.appendChild(advance_desc);
        advance_tr.appendChild(advance_amt);

        let remBtn = removeRow();
        advance_tr.appendChild(remBtn);
        tablefoot.appendChild(advance_tr);

        let all_adv_desc = tablefoot.querySelector(".advance-desc");
        all_adv_desc.value = "Advance Amount Rs";
        let balance_tr = document.createElement("tr");
        balance_tr.setAttribute("class", "balance-tr");
        let balance_desc = addFootRowDesc("balance balance-desc tfoot");
        let balance_amt = addFootRowAmount("balance balance-amt tfoot");

        balance_tr.appendChild(balance_desc);
        balance_tr.appendChild(balance_amt);

        remBtn = removeRow();

        // Add the event listener here, when creating the row
        remBtn.querySelector("button").addEventListener("click", () => {
            // When balance row is removed, recalculate based on total
            if (!isNaN(gst.value)) {
                calculateGST(Number.parseInt(gst.value));
            }
        });

        balance_tr.appendChild(remBtn);
        tablefoot.append(balance_tr);

        let all_balance_desc = tablefoot.querySelector(".balance-desc");
        all_balance_desc.value = "Balance Amount Rs";

        advance_amt.addEventListener("input", () => {
            advance();
            calculateGST(Number.parseInt(gst.value));
        });
    }
});

function total() {
    let total_amt = 0;
    let all_amt = tablefoot.querySelectorAll(".total-amount-rs");
    all_amt[all_amt.length - 1].value = total_amt;
    Array.from(tablebody.querySelectorAll(".amount-rs")).forEach(
        (amtElement) => {
            let amt = amtElement.value.trim();
            if (amt === "") {
                amt = "0"; // Treat empty fields as 0
            }
            total_amt += Number.parseInt(amt);
            console.log(total_amt);
            all_amt[all_amt.length - 1].value = total_amt;
        }
    );
    let allTotal_desc = tablefoot.querySelectorAll(".total-amount-desc");
    allTotal_desc[allTotal_desc.length - 1].value = "Total Amount Rs";

    return total_amt;
}

function advance() {
    let t = total();
    let adv = Number.parseFloat(tablefoot.querySelector(".advance-rs").value) || 0;
    let balance_amt = tablefoot.querySelector(".balance-amt");
    balance_amt.value = t - adv;
    return t - adv;
}

function addFootRowDesc(classname) {
    let td_desc = document.createElement("td");
    td_desc.setAttribute("colspan", "5");
    let textarea_desc = document.createElement("textarea");
    textarea_desc.setAttribute("class", `${classname} form-control text-area`);
    textarea_desc.setAttribute("rows", "1");
    textarea_desc.addEventListener("input", () => {
        textareaHeight(textarea_desc);
    });
    td_desc.appendChild(textarea_desc);
    return td_desc;
}

function addFootRowAmount(classname) {
    let td_amt = document.createElement("td");
    let textarea_amt = document.createElement("textarea");
    textarea_amt.setAttribute("class", `${classname} form-control text-area`);
    textarea_amt.setAttribute("rows", "1");
    textarea_amt.addEventListener("input", () => {
        textareaHeight(textarea_amt);
    });
    td_amt.appendChild(textarea_amt);
    return td_amt;
}

// let gst = document.querySelector("#add-gst");
gst.addEventListener("change", () => {
    generateGSTRows();
    calculateGST(Number.parseInt(gst.value));
});

function generateGSTRows() {
    if (!document.querySelector(".gst")) {
        let cgst_tr = document.createElement("tr");
        cgst_tr.setAttribute("class", "cgst-tr");
        let cgst_desc = addFootRowDesc("gst cgst-desc tfoot");
        let cgst_amt = addFootRowAmount("cgst-amount tfoot");

        let remBtn = removeRow();

        cgst_tr.appendChild(cgst_desc);
        cgst_tr.appendChild(cgst_amt);
        cgst_tr.appendChild(remBtn);
        tablefoot.appendChild(cgst_tr);

        let sgst_tr = document.createElement("tr");
        sgst_tr.setAttribute("class", "sgst-tr");
        let sgst_desc = addFootRowDesc("gst sgst-desc tfoot");
        let sgst_amt = addFootRowAmount("sgst-amount tfoot");

        remBtn = removeRow();

        sgst_tr.appendChild(sgst_desc);
        sgst_tr.appendChild(sgst_amt);
        sgst_tr.appendChild(remBtn);
        tablefoot.appendChild(sgst_tr);

        let grandTotal_tr = document.createElement("tr");
        grandTotal_tr.setAttribute("class", "grandTotal-tr");
        let grandTotal_desc = addFootRowDesc("grandTotal-desc tfoot");
        let grandTotal_amt = addFootRowAmount("grandTotal-amount tfoot");

        remBtn = removeRow();

        grandTotal_tr.appendChild(grandTotal_desc);
        grandTotal_tr.appendChild(grandTotal_amt);
        grandTotal_tr.appendChild(remBtn);
        tablefoot.appendChild(grandTotal_tr);
    }
}

function calculateGST(gst_pct) {
    let tax_amount = 0;
    if (document.querySelector(".total")) {
        tax_amount = total();
    }

    if (document.querySelector(".balance-amt")) {
        tax_amount = advance();
    }

    let cgstAmount = (tax_amount * (gst_pct / 2)) / 100;
    let sgstAmount = cgstAmount;

    if (document.querySelector(".gst")) {
        let cgst_desc = tablefoot.querySelector(".cgst-desc");
        cgst_desc.value = `${gst_pct / 2}% CGST`;
        let cgst_amt = tablefoot.querySelector(".cgst-amount");
        cgst_amt.value = cgstAmount;

        let sgst_desc = tablefoot.querySelector(".sgst-desc");
        sgst_desc.value = `${gst_pct / 2}% SGST`;
        let sgst_amt = tablefoot.querySelector(".sgst-amount");
        sgst_amt.value = sgstAmount;

        let grandTotalAmount = tax_amount + cgstAmount + sgstAmount;
        let grandTotal_desc = tablefoot.querySelector(".grandTotal-desc");
        grandTotal_desc.value = `Grand Total Amount Rs`;

        let grandTotal_amt = tablefoot.querySelector(".grandTotal-amount");
        grandTotal_amt.value = grandTotalAmount;
    }
}

let imageRadio = document.querySelector("#image");
let textRadio = document.querySelector("#text");

let letterHead = document.querySelector("#company-details-option");
letterHead.addEventListener("change", () => {
    if (letterHead.value === "image" && !document.getElementById("imgInput")) {
        companyLetterHead.innerHTML = `<img src="" alt="" id="img" class="hidden" style="max-width: 100%; max-height: 100px;">
            <div id="imgInput" class="mb-3">
            <label for="letter-head-img" class="form-label"> Choose an image </label>
            <input class="form-control" type="file" id="letter-head-img" accept="image/* ">
            </div> `;
        document
            .getElementById("letter-head-img")
            .addEventListener("change", (e) => {
                let file = e.target.files[0];
                if (file) {
                    let reader = new FileReader();
                    reader.onload = (e) => {
                        let img = document.getElementById("img");
                        img.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
                companyLetterHead.querySelector("#imgInput").remove();
            });
    } else if (letterHead.value === "text") {
        companyLetterHead.innerHTML = `<div id="companyLetterHead"> <div class="input-group input-group-lg mb-1">
            <span class="input-group-text"><button class="addCompanyRow btn btn-lg btn-success rounded-circle p-2">
                ❌
            </button></span>
                    <input
                        type="text"
                        name="company-name"
                        id="company-name"
                        class="form-control companyLetterHeadInput text-center"
                        placeholder="Enter your company name"
                    />
                </div>
                <div class="input-group input-group mb-1">
            <span class="input-group-text"><button class="addCompanyRow btn btn-success rounded-circle p-2 ">
                ❌
            </button></span>
                    <input
                        type="text"
                        name="company-name"
                        id="company-desc"
                        class="form-control companyLetterHeadInput text-center"
                        placeholder="Enter your company description"
                    />
                </div>
                <div class="input-group input-group-sm mb-1">
            <span class="input-group-text"><button class="addCompanyRow btn btn-sm btn-success rounded-circle p-2">
                ❌
            </button></span>
                    <input
                        type="text"
                        name="company-name"
                        id="company-address"
                        class="form-control companyLetterHeadInput text-center"
                        placeholder="Enter your company address"
                    />
                </div></div>`;
        let count = 0;
        Array.from(document.querySelectorAll(".addCompanyRow")).forEach(
            (btn) => {
                btn.addEventListener("click", (e) => {
                    count += 1;
                    companyLetterHead.querySelector(
                        "#companyLetterHead"
                    ).innerHTML += `<div class="input-group input-group-sm mb-1">
                        <span class="input-group-text"><button class="addCompanyRow btn btn-sm btn-success rounded-circle p-2">
                        ❌
                        </button></span>
                        <input
                        type="text"
                        name="company-name"
                        id="company-added-${count}"
                        class="form-control companyLetterHeadInput text-center"
                        />
                        </div>`;
                });
            }
        );
    }
    else{
        companyLetterHead.innerHTML = "";
    }
});

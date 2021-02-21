$('document').ready(function () {

    const
        harga = $('#harga'),
        lot = $('#lot'),
        brokerFee = $('#brokerFee'),
        levy = $('#levy'),
        pph = $('#pph'),
        ppn = $('#ppn'),
        totalBiaya = $('#totalBiaya'),
        totalHargaSaham = $('#totalHargaSaham'),
        total = $('#total');

    let
        int_harga = 0,
        int_lot = 0;


    hidePph();
    // input filter only number
    harga.inputFilter(function (value) {
        return /^\d*\.?\d*$/.test(value); // Allow digits and '.' only, using a Regex
    });

    lot.inputFilter(function (value) {
        return /^\d*\.?\d*$/.test(value); // Allow digits and '.' only, using a Regex
    });
    // end input filter only number

    harga.on(
        "keyup",
        debounce(function (e) {
            e.target.value = formatRupiah(e.target.value);
            int_harga = int(harga.val());
            if (int(e.target.value) < 50) {
                e.target.value = 50;
                int_harga = 50;
                hitung();
                return;
            }
            if (harga.val() !== "" && lot.val() !== "") {
                // jalankan perhitungan
                hitung()
            } else {
                reset();
            }
        }, 800)
    );

    lot.on(
        "keyup",
        debounce(function (e) {
            e.target.value = formatRupiah(e.target.value);
            int_lot = (int(lot.val()) * 100);
            if (harga.val() !== "" && lot.val() !== "") {
                // jalankan perhitungan
                hitung();
            } else {
                reset();
            }
        }, 800)
    );


    // handle switch JUAL / BELI
    $('#jubel').change(function () {
        const btn = $('#jubel').prop('checked');
        if (btn === true) {
            // jika sedang posisi BELI
            hidePph();
            pph.val('0');
            hitung();
        } else {
            // jika sedang posisi JUAL
            showPph();
            changePPH();
            hitung();
        }
    })

    function changeBrokerFee() {
        let totalBroker = Math.ceil((int_harga * int_lot) * 0.001);
        let res = formatRupiah(totalBroker.toString());
        brokerFee.val(res);
    }

    function changeLevy() {
        let totalLevy = Math.ceil((int_harga * int_lot) * 0.0004);
        let res = formatRupiah(totalLevy.toString());
        levy.val(res);
    }

    function changePPN() {
        let totalBroker = Math.ceil((int_harga * int_lot) * 0.001);
        let totalPpn = Math.round(totalBroker * 0.1);
        let res = formatRupiah(totalPpn.toString());
        ppn.val(res);
    }

    function changeTotalHargaSaham() {
        let totalHarga = Math.ceil(int_harga * int_lot);
        let res = formatRupiah(totalHarga.toString());
        totalHargaSaham.val(res);
    }

    function changeTotalBiaya() {
        let totalBroker = Math.floor((int_harga * int_lot) * 0.001);
        let totalLevy = Math.ceil((int_harga * int_lot) * 0.0004);
        let totalPpn = Math.floor(totalBroker * 0.1);
        let subTotal = Math.floor(totalBroker + totalLevy + totalPpn);
        // jika JUAL maka tambahkan PPH
        const btn = $('#jubel').prop('checked');
        if (btn === false) {
            subTotal += Math.floor((int_harga * int_lot) * 0.001);
        }
        let res = formatRupiah(subTotal.toString());
        totalBiaya.val(res);
    }

    function changeTotal() {
        let totalBroker = Math.floor((int_harga * int_lot) * 0.001);
        let totalLevy = Math.ceil((int_harga * int_lot) * 0.0004);
        let totalPpn = Math.floor(totalBroker * 0.1);
        let tot = Math.floor(totalBroker + totalLevy + totalPpn + (int_harga * int_lot));
        // jika JUAL maka tambahkan PPH
        const btn = $('#jubel').prop('checked');
        if (btn === false) {
            tot += Math.floor((int_harga * int_lot) * 0.001);
        }
        let res = formatRupiah(tot.toString());
        total.val('Rp. ' + res);
    }

    function changePPH() {
        let tot = Math.floor((int_harga * int_lot) * 0.001);
        let res = formatRupiah(tot.toString());
        pph.val(res);
    }

    function hitung() {
        changeBrokerFee();
        changeLevy();
        changePPN();
        changeTotalBiaya();
        changeTotalHargaSaham();
        changeTotal();
        if ($('#jubel').prop('checked') === false) {
            changePPH();
        }
    }

    function reset() {
        brokerFee.val('0');
        levy.val('0');
        pph.val('0');
        ppn.val('0');
        sub_Total.val('0');
        total.val('Rp. 0');
    }

    function showPph() {
        $('.pphFinal').show();
        $('.totalBiaya').removeClass('offset-md-3')
    }

    function hidePph() {
        $('.pphFinal').hide();
        $('.totalBiaya').addClass('offset-md-3')
    }
});

// mengubah format ke integer
function int(data) {
    // menghilangkan . pada nominal
    let int = parseInt(data.replace(".", ""));
    return int;
}


(function ($) {
    $.fn.inputFilter = function (inputFilter) {
        return this.on("input keyup keydown mousedown mouseup select contextmenu drop", function () {
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
            } else if (this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            } else {
                this.value = "";
            }
        });
    };
}(jQuery));



function formatRupiah(angka) {
    let number_string = angka.replace(/[^,\d]/g, '').toString(),
        split = number_string.split(','),
        sisa = split[0].length % 3,
        rupiah = split[0].substr(0, sisa),
        ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    // tambahkan titik jika yang di input sudah menjadi angka ribuan
    if (ribuan) {
        separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }

    rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
    return rupiah;
}

const debounce = (fn, delay) => {
    let timeoutID;

    return function (...args) {
        if (timeoutID) {
            clearTimeout(timeoutID);
        }
        timeoutID = setTimeout(() => {
            fn(...args);
        }, delay);
    };
};
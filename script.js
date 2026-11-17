
// ========================================
// MIE CUANDU - JAVASCRIPT UTAMA
// ========================================

let keranjang = JSON.parse(localStorage.getItem("keranjang")) || [];
let menuDibuka = null;

function ambil(id) {
  return document.getElementById(id);
}

function cariKartu(id) {
  const semuaKartu = document.querySelectorAll("#grid-produk .kartu");
  return Array.from(semuaKartu).find(kartu =>
    Number(kartu.dataset.id) === Number(id)
  ) || null;
}

function rupiah(angka) {
  return "Rp" + Number(angka).toLocaleString("id-ID");
}

function sudahMasuk() {
  return localStorage.getItem("masuk") === "ya";
}

// SIMPAN KERANJANG
function simpanKeranjang() {
  localStorage.setItem("keranjang", JSON.stringify(keranjang));
  const total = keranjang.reduce((jumlah, item) => jumlah + Number(item.jumlah), 0);
  ambil("lencana-keranjang").textContent = total;
}

// ATUR HALAMAN
function aturHalaman() {
  const bagian = (location.hash || "#/").split("/");
  let halaman = "katalog";

  if (bagian[1] === "detail" && !sudahMasuk()) {
    sessionStorage.setItem("tujuanSetelahLogin", location.hash);
    halaman = "login";
  } else if (bagian[1] === "login") {
    halaman = "login";
  } else if (bagian[1] === "detail") {
    halaman = "detail";
  } else if (bagian[1] === "keranjang") {
    halaman = "keranjang";
  } else if (bagian[1] === "checkout") {
    halaman = "checkout";
  } else if (bagian[1] === "konfirmasi") {
    halaman = "konfirmasi";
  }

  if (halaman === "checkout" && keranjang.length === 0) {
    location.hash = "#/keranjang";
    return;
  }

  document.body.dataset.halaman = halaman;
  document.documentElement.classList.toggle("sudah-masuk", sudahMasuk());

  ["katalog", "login", "detail", "keranjang", "checkout", "konfirmasi"].forEach(nama => {
    ambil("halaman-" + nama).hidden = halaman !== nama;
  });

  if (halaman === "detail") tampilkanDetail(Number(bagian[2]));
  if (halaman === "keranjang") tampilkanKeranjang();
  if (halaman === "checkout") tampilkanRingkasanCheckout();
  if (halaman === "konfirmasi") tampilkanKonfirmasi();

  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", aturHalaman);

// LOGIN SEBELUM MEMBUKA DETAIL MENU
ambil("grid-produk").addEventListener("click", function(e) {
  const tautan = e.target.closest(".kartu-tautan");
  if (!tautan || sudahMasuk()) return;

  e.preventDefault();
  sessionStorage.setItem("tujuanSetelahLogin", tautan.getAttribute("href"));
  location.hash = "#/login";
});

// HEADER, PENCARIAN, DAN LOGOUT
ambil("input-cari").addEventListener("input", tampilkanKatalog);

ambil("form-cari").addEventListener("submit", function(e) {
  e.preventDefault();
  tampilkanKatalog();
});

ambil("tombol-keluar").addEventListener("click", function() {
  localStorage.removeItem("masuk");
  location.hash = "#/";
  aturHalaman();
});

// KATALOG DAN PESAN MENU TIDAK DITEMUKAN
function tampilkanKatalog() {
  const pilihanKategori = document.querySelector('input[name="kategori"]:checked');
  const kategori = pilihanKategori ? pilihanKategori.value : "semua";
  const kata = ambil("input-cari").value.trim().toLowerCase();
  let jumlahCocok = 0;

  document.querySelectorAll("#grid-produk .kartu").forEach(kartu => {
    const cocokKategori = kategori === "semua" || kartu.dataset.kategori === kategori;
    const cocokKata = kartu.textContent.toLowerCase().includes(kata);
    const tampil = cocokKategori && cocokKata;

    kartu.hidden = !tampil;
    if (tampil) jumlahCocok++;
  });

  // Pesan tampil jika menu tidak ditemukan
  ambil("katalog-kosong").hidden = jumlahCocok > 0;
}

ambil("halaman-katalog").addEventListener("change", tampilkanKatalog);

// LOGIN DEMO
const USERNAME = "nadhia";
const PASSWORD = "1234";

ambil("form-login").addEventListener("submit", function(e) {
  e.preventDefault();

  const benar =
    ambil("isian-username").value.trim().toLowerCase() === USERNAME &&
    ambil("isian-password").value === PASSWORD;

  ambil("login-salah").hidden = benar;

  if (benar) {
    localStorage.setItem("masuk", "ya");
    this.reset();

    const tujuan = sessionStorage.getItem("tujuanSetelahLogin");
    sessionStorage.removeItem("tujuanSetelahLogin");

    location.hash = tujuan || "#/";
    aturHalaman();
  }
});

// DETAIL MENU
function tampilkanDetail(id) {
  menuDibuka = cariKartu(id);

  ambil("detail-tidak-ada").hidden = Boolean(menuDibuka);
  ambil("isi-detail").hidden = !menuDibuka;
  if (!menuDibuka) return;

  ambil("detail-gambar").src = menuDibuka.querySelector(".foto").src;
  ambil("detail-nama").textContent = menuDibuka.dataset.nama;
  ambil("detail-deskripsi").textContent = menuDibuka.dataset.deskripsi;
  ambil("isian-jumlah").value = 1;
  hitungKasir();
}

// KASIR
function hitungKasir() {
  if (!menuDibuka) return;

  const kolom = ambil("isian-jumlah");
  kolom.value = Math.max(1, Math.floor(Number(kolom.value)) || 1);

  ambil("tombol-kurang").disabled = Number(kolom.value) <= 1;
  ambil("kasir-nama").textContent = menuDibuka.dataset.nama;
  ambil("kasir-harga").textContent = rupiah(menuDibuka.dataset.harga);

  document.querySelectorAll(".total-teks").forEach(el => {
    el.textContent = rupiah(Number(menuDibuka.dataset.harga) * Number(kolom.value));
  });
}

ambil("tombol-kurang").addEventListener("click", function() {
  const kolom = ambil("isian-jumlah");
  kolom.value = Math.max(1, Number(kolom.value) - 1);
  hitungKasir();
});

ambil("tombol-tambah").addEventListener("click", function() {
  const kolom = ambil("isian-jumlah");
  kolom.value = Number(kolom.value) + 1;
  hitungKasir();
});

ambil("isian-jumlah").addEventListener("change", hitungKasir);

// TAMBAH KE KERANJANG
function masukKeranjang(tambah) {
  if (!menuDibuka) return;

  const id = Number(menuDibuka.dataset.id);
  const jumlah = Number(ambil("isian-jumlah").value);
  const item = keranjang.find(i => Number(i.id) === id);

  if (item) {
    item.jumlah = tambah ? Number(item.jumlah) + jumlah : jumlah;
    item.harga = Number(menuDibuka.dataset.harga);
  } else {
    keranjang.push({
      id,
      jumlah,
      harga: Number(menuDibuka.dataset.harga)
    });
  }

  simpanKeranjang();
}

// TAMPILKAN KERANJANG
function tampilkanKeranjang() {
  const daftar = ambil("daftar-keranjang");
  const kosong = ambil("keranjang-kosong");
  const isi = ambil("keranjang-isi");

  daftar.innerHTML = "";
  let totalJumlah = 0;
  let totalHarga = 0;

  keranjang.forEach(item => {
    const kartu = cariKartu(item.id);
    const nama = kartu ? kartu.dataset.nama : "Menu " + item.id;
    const foto = kartu ? kartu.querySelector(".foto") : null;
    const gambar = foto ? foto.src : "";
    const harga = Number(item.harga);
    const jumlah = Number(item.jumlah);
    const subtotal = harga * jumlah;

    totalJumlah += jumlah;
    totalHarga += subtotal;

    const baris = document.createElement("div");
    baris.className = "baris-keranjang";
    baris.innerHTML = `
      <div class="baris-gambar">${gambar ? `<img src="${gambar}" alt="${nama}" width="56">` : ""}</div>
      <div class="baris-info">
        <a href="#/detail/${item.id}">${nama}</a>
        <p>${rupiah(harga)}</p>
      </div>
      <div class="baris-aksi">
        <div class="pengatur-jumlah">
          <button type="button" class="kurangi-item">−</button>
          <span>${jumlah}</span>
          <button type="button" class="tambah-item">+</button>
        </div>
        <span class="baris-subtotal">${rupiah(subtotal)}</span>
        <button type="button" class="tombol-teks hapus-item">Hapus</button>
      </div>`;

    baris.querySelector(".kurangi-item").addEventListener("click", function() {
      item.jumlah--;
      if (item.jumlah <= 0) keranjang = keranjang.filter(i => i !== item);
      simpanKeranjang();
      tampilkanKeranjang();
    });

    baris.querySelector(".tambah-item").addEventListener("click", function() {
      item.jumlah++;
      simpanKeranjang();
      tampilkanKeranjang();
    });

    baris.querySelector(".hapus-item").addEventListener("click", function() {
      keranjang = keranjang.filter(i => i !== item);
      simpanKeranjang();
      tampilkanKeranjang();
    });

    daftar.appendChild(baris);
  });

  ambil("keranjang-jumlah").textContent = totalJumlah;
  ambil("keranjang-subtotal").textContent = rupiah(totalHarga);

  const adaBarang = totalJumlah > 0;
  kosong.hidden = adaBarang;
  isi.hidden = !adaBarang;
}

// RINGKASAN CHECKOUT
function tampilkanRingkasanCheckout() {
  const daftar = ambil("ringkasan-checkout");
  daftar.innerHTML = "";
  let total = 0;

  keranjang.forEach(item => {
    const kartu = cariKartu(item.id);
    const nama = kartu ? kartu.dataset.nama : "Menu " + item.id;
    const harga = Number(item.harga);
    const jumlah = Number(item.jumlah);
    const subtotal = harga * jumlah;
    total += subtotal;

    const baris = document.createElement("div");
    baris.className = "baris-keranjang";
    baris.innerHTML = `
      <div class="baris-info">
        <strong>${nama}</strong>
        <p>${rupiah(harga)} × ${jumlah}</p>
      </div>
      <div class="baris-aksi"><span class="baris-subtotal">${rupiah(subtotal)}</span></div>`;
    daftar.appendChild(baris);
  });

  ambil("checkout-total").textContent = rupiah(total);
}

// PROSES PESANAN
ambil("form-checkout").addEventListener("submit", function(e) {
  e.preventDefault();

  if (keranjang.length === 0) {
    alert("Keranjang kamu masih kosong!");
    location.hash = "#/keranjang";
    return;
  }

  const totalBayar = keranjang.reduce((total, item) =>
    total + Number(item.harga) * Number(item.jumlah), 0
  );

  sessionStorage.setItem("totalPesananTerakhir", totalBayar);
  keranjang = [];
  simpanKeranjang();
  this.reset();
  location.hash = "#/konfirmasi";
});

// KONFIRMASI
function tampilkanKonfirmasi() {
  const total = sessionStorage.getItem("totalPesananTerakhir");
  if (total === null) {
    location.hash = "#/";
    return;
  }
  ambil("konfirmasi-total").textContent = rupiah(total);
}

// TOMBOL AKSI DETAIL
ambil("tombol-keranjang").addEventListener("click", function() {
  masukKeranjang(true);
  const tombol = this;
  tombol.textContent = "Ditambahkan ✓";
  setTimeout(() => {
    tombol.textContent = "Tambah ke keranjang";
  }, 1200);
});

ambil("tombol-pesan").addEventListener("click", function() {
  masukKeranjang(false);
  location.hash = "#/checkout";
});

// JALANKAN SAAT WEBSITE DIBUKA
simpanKeranjang();
tampilkanKatalog();
aturHalaman();

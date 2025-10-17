//class sản phẩm
class Product {
  constructor(id, name, price, image, category, hot, description) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.image = image;
    this.category = category;
    this.hot = hot;
    this.description = description;
  }
  render() {
    return `
                        <div class="product">
                            <img src="${this.image}">
                            <a href="detail.html?id=${this.id}"><h4>${this.name}</h4></a>
                            <p>Giá : ${this.price} đ </p>
                        </div>
                `;
  }
  renderDetail() {
    return `
                        <div class="product-detail">
                            <img src="${this.image}">
                            <div class="product-info">
                                <h2>${this.name}</h2>
                                <p>Giá : ${this.price} đ </p>
                                <p>Danh mục : ${this.category}</p>
                                <p>Mô tả : ${this.description}</p>
                                <button id="addCartBtn" productId="${this.id}">Thêm vào giỏ hàng</button>
                            </div>
                        </div>
        `;
  }
}
//show trang chủ
const productHot = document.getElementById("product-hot");
const productLaptop = document.getElementById("product-laptop");
const productDienThoai = document.getElementById("product-dienthoai");
if (productHot) {
  fetch("http://localhost:3000/products")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const dataHot = data.filter((p) => p.hot == true);
      const dataLaptop = data.filter((p) => p.category === "laptop");
      const dataPhone = data.filter((p) => p.category === "điện thoại");
      //Show sản phẩm nổi bật
      renderProduct(dataHot, productHot);
      //show sản phẩm laptop
      renderProduct(dataLaptop, productLaptop);
      //show sản phẩm điện thoại
      renderProduct(dataPhone, productDienThoai);
    });
}
//Show trang sản phẩm
const productAll = document.getElementById("all-product");
const searchInput = document.getElementById("search-input");
const sortPrice = document.getElementById("sort-price");
let allProductsData = [];
if (productAll) {
  fetch("http://localhost:3000/products")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      renderProduct(data, productAll);
      allProductsData = data;
    });
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const keyword = e.target.value.toLowerCase();
      const filteredProducts = allProductsData.filter((p) =>
        p.name.toLowerCase().includes(keyword)
      );
      renderProduct(filteredProducts, productAll);
    });
  }
  if (sortPrice) {
    sortPrice.addEventListener("change", (e) => {
      // alert(e.target.value);
      if (e.target.value === "asc") {
        allProductsData.sort((a, b) => a.price - b.price);
      } else if (e.target.value === "desc") {
        allProductsData.sort((a, b) => b.price - a.price);
      }
      renderProduct(allProductsData, productAll);
    });
  }
}

const renderProduct = (array, theDiv) => {
  let html = "";
  array.forEach((item) => {
    const product = new Product(
      item.id,
      item.name,
      item.price,
      item.image,
      item.category,
      item.hot,
      item.description
    );
    html += product.render();
  });
  theDiv.innerHTML = html;
};

//Show chi tiết sản phẩm
const productDetailDiv = document.getElementById("product-detail");
if (productDetailDiv) {
  //lấy id từ url
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  console.log(id);
  fetch(`http://localhost:3000/products/${id}`)
    .then((response) => response.json())
    .then((item) => {
      console.log(item);
      const product = new Product(
        item.id,
        item.name,
        item.price,
        item.image,
        item.category,
        item.hot,
        item.description
      );
      productDetailDiv.innerHTML = product.renderDetail();
    });
}

//Class cart
class Cart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem("cart")) || [];
  }
  addItem(product) {
    const existingItem = this.items.find((item) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      // Thêm toàn bộ thông tin sản phẩm và thêm quantity
      this.items.push({
        ...product, // Lưu hết tất cả thuộc tính của sản phẩm
        quantity: 1,
      });
    }
    // Lưu vào localStorage sau khi thêm
    localStorage.setItem("cart", JSON.stringify(this.items));
  }
  getTotal() {
    return this.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }
  //render dưới dạng table
  render() {
    let html = `
            <h3>Giỏ hàng</h3>
            <table>
                <tr>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                </tr>
        `;
    this.items.forEach((item) => {
      html += `
                <tr>
                    <td>${item.product.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.product.price * item.quantity} đ</td>
                </tr>
            `;
    });
    html += "</table>";
    return html;
  }
}

//Tạo giỏ hàng
const cart = new Cart();

//Thêm sự kiện cho nút thêm vào giỏ hàng
document.addEventListener("click", function (e) {
  if (e.target && e.target.id === "addCartBtn") {
    const productId = e.target.getAttribute("productId");
    fetch(`http://localhost:3000/products/${productId}`)
      .then((response) => response.json())
      .then((item) => {
        const product = new Product(
          item.id,
          item.name,
          item.price,
          item.image,
          item.category,
          item.hot,
          item.description
        );
        cart.addItem(product);
        console.log(cart.items);
        // Cập nhật số lượng trên liên kết trên menu giỏ hàng header
        const cartLink = document.querySelector(
          'header nav a[href="cart.html"]'
        );
        if (cartLink) {
          cartLink.textContent = `Giỏ hàng (${cart.items.length})`;
        }
      });
  }
});
//Tự tạo ra render và header gắn vào tất cả các trang
const header = document.createElement("header");
header.innerHTML = `
    <h1>Cửa hàng điện tử</h1>
    <nav>
        <a href="index.html">Trang chủ</a>
        <a href="product.html">Sản phẩm</a>
        <a href="cart.html">Giỏ hàng (${cart.items.length})</a>
    </nav>
`;
document.body.prepend(header);

//Tạo footer
const footer = document.createElement("footer");
footer.innerHTML = `
    <p>&copy; 2024 Cửa hàng điện tử. All rights reserved.</p>
`;
document.body.appendChild(footer);

// 전역 변수 선언
const modal = document.querySelector(".modal-overlay");
const modalCover = modal.querySelector(".book-cover");
const modalTitle = modal.querySelector(".book-details h2");
const modalAuthor = modal.querySelector(".book-details .author");
const modalPublishDate = modal.querySelector(".book-details .publish-date");
const modalPrice = modal.querySelector(".book-details .price");
const modalStars = modal.querySelector(".book-details .stars");
const modalScore = modal.querySelector(".book-details .score");
const modalDescription = modal.querySelector(".book-details .description");
const closeModal = modal.querySelector(".close-btn");
const moreInfoBtn = document.querySelector(".more-info");
const modalHeart = modal.querySelector(".heart i");

const selectBtn = document.querySelector(".select-btn");
const selectOptions = document.querySelector(".select-options");
const optionItems = document.querySelectorAll(".option-item");
const hiddenInput = document.createElement("input");
hiddenInput.type = "hidden";
hiddenInput.name = "queryType";
hiddenInput.value = "title";
document.querySelector(".search-box").appendChild(hiddenInput);

const favoriteBooks = JSON.parse(localStorage.getItem("favoriteBooks")) || [];

// 할인율 계산 함수
function calculateDiscount(priceStandard, priceSales) {
  if (!priceStandard || !priceSales || priceStandard <= priceSales) return 0;
  return Math.round(((priceStandard - priceSales) / priceStandard) * 100);
}
// 모달 창을 여는 함수
function openModal(bookElement) {
  const title = bookElement.getAttribute("data-title");
  const author = bookElement.getAttribute("data-author");
  const publishDate = bookElement.getAttribute("data-publish-date");
  const description = bookElement.getAttribute("data-description");
  const coverSrc = bookElement.querySelector("img").src;
  const priceStandard = parseInt(
    bookElement.getAttribute("data-price-standard")
  );
  const priceSales = parseInt(bookElement.getAttribute("data-price-sales"));
  const customerReviewRank = parseInt(
    bookElement.getAttribute("data-customer-review-rank")
  );
  const score = (customerReviewRank / 2).toFixed(1);
  const bookLink = bookElement.getAttribute("data-link");

  const discountRate = calculateDiscount(priceStandard, priceSales);

  const fullStars = Math.floor(score);
  const halfStar = score % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  const starsHtml =
    "★".repeat(fullStars) + (halfStar ? "½" : "") + "☆".repeat(emptyStars);
  modalStars.innerHTML = starsHtml;
  modalScore.textContent = score;

  modalCover.src = coverSrc;
  modalTitle.textContent = title || "제목 정보 없음";
  modalAuthor.textContent = author || "저자 정보 없음";
  modalPublishDate.textContent = publishDate || "출판일 정보 없음";
  modalPrice.innerHTML = `<span class="discount">${discountRate}%</span> ${priceSales.toLocaleString()}원`;
  modalDescription.textContent = description || "설명 정보 없음";

  // 하트 아이콘 초기화 (모달이 열릴 때 현재 상태를 반영)
  if (favoriteBooks.some((book) => book.title === title)) {
    modalHeart.classList.remove("far");
    modalHeart.classList.add("fas");
  } else {
    modalHeart.classList.remove("fas");
    modalHeart.classList.add("far");
  }

  moreInfoBtn.onclick = function () {
    window.location.href = bookLink;
  };

  modal.style.display = "flex";
}

// 모달 창을 닫는 함수
function closeModalFunc() {
  modal.style.display = "none";
}

closeModal.addEventListener("click", closeModalFunc);

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModalFunc();
  }
});

// 모달 안의 하트 아이콘에 클릭 이벤트 추가
modalHeart.addEventListener("click", (event) => {
  event.stopPropagation();

  const title = modalTitle.textContent;
  const author = modalAuthor.textContent;
  const cover = modalCover.src;
  const description = modalDescription.textContent;
  const priceStandard = parseInt(
    modalPrice.getAttribute("data-price-standard")
  );
  const priceSales = parseInt(modalPrice.getAttribute("data-price-sales"));
  const customerReviewRank = parseInt(modalScore.textContent) * 2;

  if (modalHeart.classList.contains("far")) {
    modalHeart.classList.remove("far");
    modalHeart.classList.add("fas");

    const book = {
      title,
      author,
      cover,
      description,
      priceStandard,
      priceSales,
      customerReviewRank,
    };

    // 로컬 스토리지에서 기존 즐겨찾기 목록을 가져옴
    const favoriteBooks =
      JSON.parse(localStorage.getItem("favoriteBooks")) || [];

    // 중복 여부 확인
    const isDuplicate = favoriteBooks.some((b) => b.title === title);
    if (!isDuplicate) {
      favoriteBooks.push(book);
      localStorage.setItem("favoriteBooks", JSON.stringify(favoriteBooks));
      console.log("책 저장완료!:", book);
    } else {
      console.log("이미 저장된 책:", title);
    }
  } else {
    modalHeart.classList.remove("fas");
    modalHeart.classList.add("far");

    // 로컬 스토리지에서 기존 즐겨찾기 목록을 가져옴
    const favoriteBooks =
      JSON.parse(localStorage.getItem("favoriteBooks")) || [];

    const updatedBooks = favoriteBooks.filter((b) => b.title !== title);
    localStorage.setItem("favoriteBooks", JSON.stringify(updatedBooks));
    console.log("책 정보가 로컬 스토리지에서 삭제되었습니다:", title);
  }
});

// 검색창 옵션 이벤트
selectBtn.addEventListener("click", function () {
  selectOptions.classList.toggle("show");
});

optionItems.forEach((item) => {
  item.addEventListener("click", function () {
    selectBtn.innerHTML =
      this.innerHTML + ' <i class="fa-solid fa-angle-down"></i>';
    selectOptions.classList.remove("show");
    hiddenInput.value = this.getAttribute("data-value");
  });
});

document.addEventListener("click", function (event) {
  if (
    !selectBtn.contains(event.target) &&
    !selectOptions.contains(event.target)
  ) {
    selectOptions.classList.remove("show");
  }
});

// 검색어 입력시 bookSearch에 파라미터 값 전달하기
document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.querySelector(".search-box button");
  const searchInput = document.querySelector(".search-box input");

  searchButton.addEventListener("click", function () {
    const query = searchInput.value.trim();
    const queryType = hiddenInput.value;

    fetch(`/api/search?query=${query}&queryType=${queryType}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
});

// 1. 신간 전체 리스트 가져오기
fetch("http://localhost:3000/api/list?queryType=ItemNewAll&searchTarget=Book")
  .then((response) => response.json())
  .then((data) => {
    console.log("신간 전체 리스트:", data);

    const bookListContainer = document.querySelector(".newBooks-list");
    const books = data.item.slice(0, 5);

    books.forEach((book) => {
      // 슬라이드 HTML 구조를 생성합니다.
      const bookElement = document.createElement("article");
      bookElement.classList.add("book");

      bookElement.innerHTML = `
                <img src="${book.cover}" alt="${book.title}" />
                <p class="title">${book.title}</p>
                <p class="author">${book.author}</p>
              `;
      // 데이터 속성 추가
      bookElement.setAttribute("data-title", book.title);
      bookElement.setAttribute("data-author", book.author);
      bookElement.setAttribute("data-description", book.description);
      bookElement.setAttribute("data-price-standard", book.priceStandard);
      bookElement.setAttribute("data-price-sales", book.priceSales);
      bookElement.setAttribute(
        "data-customer-review-rank",
        book.customerReviewRank
      );

      // 생성된 책 요소를 컨테이너에 추가
      bookListContainer.appendChild(bookElement);

      // 책 요소에 클릭 이벤트 추가
      bookElement.addEventListener("click", () => openModal(bookElement));
    });
  })
  .catch((error) => {
    console.error("API 요청 중 오류 발생:", error);
  });

// 2. 베스트셀러 리스트를 API로 가져오기
fetch("http://localhost:3000/api/list?queryType=Bestseller&searchTarget=Book")
  .then((response) => response.json())
  .then((data) => {
    // 받아온 데이터 구조 확인
    console.log("베스트셀러 리스트:", data);

    // 슬라이드를 담을 컨테이너를 찾기
    const swiperWrapper = document.querySelector(".swiper-wrapper");

    // API에서 받은 데이터를 순회하여 슬라이드를 생성
    data.item.forEach((book) => {
      // 할인율 계산
      const discountRate = Math.round(
        ((book.priceStandard - book.priceSales) / book.priceStandard) * 100
      );

      // 슬라이드 HTML 구조를 생성합니다.
      const slide = document.createElement("div");
      slide.classList.add("swiper-slide");

      slide.innerHTML = `
        <img src="${book.cover}" alt="Book Cover" />
        <div class="text-content">
          <p class="title">${book.title}</p>
          <p class="author">${book.author}</p>
          <div class="price-discount">
            <i class="discount">${discountRate}%</i>
            <i class="price">${book.priceSales.toLocaleString()}원</i>
          </div>
          <p class="content">
            ${book.description}
          </p>
        </div>
      `;
      // 데이터 속성 추가
      slide.setAttribute("data-title", book.title);
      slide.setAttribute("data-author", book.author);
      slide.setAttribute("data-price-standard", book.priceStandard);
      slide.setAttribute("data-price-sales", book.priceSales);
      slide.setAttribute("data-description", book.description);
      slide.setAttribute("data-customer-review-rank", book.customerReviewRank);
      slide.setAttribute("data-link", book.link);

      // 생성된 슬라이드를 컨테이너에 추가
      swiperWrapper.appendChild(slide);
      // 책 요소에 클릭 이벤트 추가
      slide.addEventListener("click", () => openModal(slide));
    });
  })
  .catch((error) => {
    console.error("API 요청 중 오류 발생:", error);
  });

// 3. 신간 전체 리스트 가져오기
fetch(
  "http://localhost:3000/api/list?queryType=ItemNewSpecial&searchTarget=Book"
)
  .then((response) => response.json())
  .then((data) => {
    const bookListContainer = document.querySelector(".recommended-list");
    const books = data.item.slice(0, 5);
    console.log("주목할만한 신간:", books);

    // API에서 받은 데이터를 순회하여 슬라이드를 생성
    books.forEach((book) => {
      const bookElement = document.createElement("article");
      bookElement.classList.add("book");

      bookElement.innerHTML = `
                <img src="${book.cover}" alt="${book.title}" />
                <p class="title">${book.title}</p>
                <p class="author">${book.author}</p>
              `;
      bookElement.setAttribute("data-title", book.title);
      bookElement.setAttribute("data-author", book.author);
      bookElement.setAttribute("data-price-standard", book.priceStandard);
      bookElement.setAttribute("data-price-sales", book.priceSales);
      bookElement.setAttribute("data-description", book.description);
      bookElement.setAttribute(
        "data-customer-review-rank",
        book.customerReviewRank
      );
      bookListContainer.appendChild(bookElement);

      bookElement.addEventListener("click", () => openModal(bookElement));
    });
  })
  .catch((error) => {
    console.error("API 요청 중 오류 발생:", error);
  });
// 4. 블로그 베스트 셀러 가져오기
fetch("http://localhost:3000/api/list?queryType=BlogBest&searchTarget=Book")
  .then((response) => response.json())
  .then((data) => {
    const bookListContainer = document.querySelector(".blogBestSeller-list");
    const books = data.item.slice(0, 5);
    console.log("블로그 베스트셀러:", data.item);
    books.forEach((book) => {
      const bookElement = document.createElement("article");
      bookElement.classList.add("book");

      bookElement.innerHTML = `
                <img src="${book.cover}" alt="${book.title}" />
                <p class="title">${book.title}</p>
                <p class="author">${book.author}</p>
              `;
      bookElement.setAttribute("data-title", book.title);
      bookElement.setAttribute("data-author", book.author);
      bookElement.setAttribute("data-price-standard", book.priceStandard);
      bookElement.setAttribute("data-price-sales", book.priceSales);
      bookElement.setAttribute("data-description", book.description);
      bookElement.setAttribute(
        "data-customer-review-rank",
        book.customerReviewRank
      );

      bookListContainer.appendChild(bookElement);

      bookElement.addEventListener("click", () => openModal(bookElement));
    });
  })
  .catch((error) => {
    console.error("API 요청 중 오류 발생:", error);
  });

// 스와이퍼
var swiper = new Swiper(".mySwiper", {
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  loop: true,
  slidesPerView: "auto",
  spaceBetween: 31,
  slideToClickedSlide: true,
  speed: 400,
});

document.addEventListener("DOMContentLoaded", () => {
  const bookList = document.getElementById("bookList");
  const pagination = document.getElementById("pagination");

  // queryType을 메타 태그에서 가져오기
  const queryTypeMeta = document.querySelector('meta[name="queryType"]');
  const queryType = queryTypeMeta
    ? queryTypeMeta.getAttribute("content")
    : "ItemNewAll";

  fetch(`http://localhost:3000/api/list?queryType=${queryType}`)
    .then((response) => response.json())
    .then((data) => {
      console.log("신간 전체 리스트:", data);

      bookList.innerHTML = "";

      if (data.item && data.item.length > 0) {
        const itemsPerPage = 10;
        const totalPages = Math.ceil(data.item.length / itemsPerPage);
        let currentPage = 1;

        function renderPage(page) {
          bookList.innerHTML = "";
          const start = (page - 1) * itemsPerPage;
          const end = start + itemsPerPage;
          const pageItems = data.item.slice(start, end);

          pageItems.forEach((book) => {
            const bookHtml = `
              <article class="book" 
                data-title="${book.title}" 
                data-author="${book.author}" 
                data-publish-date="${book.publishDate}" 
                data-price-standard="${book.priceStandard}" 
                data-price-sales="${book.priceSales}" 
                data-customer-review-rank="${book.customerReviewRank}" 
                data-description="${book.description}"
                data-link="${book.link}">
                <div class="image-container">
                  <img src="${book.cover}" alt="Book Cover" />
                  <div class="overlay">
                    <i class="far fa-heart"></i>
                    <i class="fa-solid fa-circle-info modal-trigger"></i>
                  </div>
                </div>
                <p class="title">${book.title}</p>
                <p class="author">${book.author}</p>
              </article>`;
            bookList.insertAdjacentHTML("beforeend", bookHtml);
          });
        }

        function renderPagination() {
          pagination.innerHTML = "";

          const prevButton = document.createElement("button");
          prevButton.textContent = "←";
          prevButton.disabled = currentPage === 1;
          prevButton.addEventListener("click", function () {
            if (currentPage > 1) {
              currentPage--;
              renderPage(currentPage);
              renderPagination();
            }
          });
          pagination.appendChild(prevButton);

          for (let i = 1; i <= totalPages; i++) {
            const pageSpan = document.createElement("span");
            pageSpan.textContent = i;
            if (i === currentPage) {
              pageSpan.classList.add("active");
            }
            pageSpan.addEventListener("click", function () {
              currentPage = i;
              renderPage(currentPage);
              renderPagination();
            });
            pagination.appendChild(pageSpan);
          }

          const nextButton = document.createElement("button");
          nextButton.textContent = "→";
          nextButton.disabled = currentPage === totalPages;
          nextButton.addEventListener("click", function () {
            if (currentPage < totalPages) {
              currentPage++;
              renderPage(currentPage);
              renderPagination();
            }
          });
          pagination.appendChild(nextButton);
        }

        renderPage(currentPage);
        renderPagination();
      }
    });

  // 모달 창 관련 코드
  const modal = document.querySelector(".modal-overlay");
  const modalCover = document.querySelector(".book-cover");
  const modalTitle = document.querySelector(".book-details h2");
  const modalAuthor = document.querySelector(".book-details .author");
  const modalPublishDate = document.querySelector(
    ".book-details .publish-date"
  );
  const modalPrice = document.querySelector(".book-details .price");
  const modalStars = document.querySelector(".book-details .stars");
  const modalScore = document.querySelector(".book-details .score");
  const modalDescription = document.querySelector(".book-details .description");
  const closeModal = document.querySelector(".close-btn");
  const moreInfoBtn = document.querySelector(".more-info");
  const modalHeart = modal.querySelector(".heart i");

  if (
    !modal ||
    !modalCover ||
    !modalTitle ||
    !modalAuthor ||
    !modalPublishDate ||
    !modalPrice ||
    !modalStars ||
    !modalScore ||
    !modalDescription ||
    !closeModal ||
    !moreInfoBtn ||
    !modalHeart
  ) {
    console.error("모달 관련 요소를 찾을 수 없습니다.");
    return;
  }

  // 할인율 계산 함수
  function calculateDiscount(priceStandard, priceSales) {
    if (!priceStandard || !priceSales || priceStandard <= priceSales) return 0;
    return Math.round(((priceStandard - priceSales) / priceStandard) * 100);
  }

  // 책 요소를 클릭했을 때 모달 창을 여는 함수
  function openModal(bookElement) {
    // 데이터 속성들을 가져오기
    const title = bookElement.getAttribute("data-title");
    const author = bookElement.getAttribute("data-author");
    const publishDate = bookElement.getAttribute("data-publish-date");
    const stars = bookElement.getAttribute("data-stars");
    const description = bookElement.getAttribute("data-description");
    const coverSrc = bookElement.querySelector("img").src;
    const priceStandard = parseInt(
      bookElement.getAttribute("data-price-standard")
    );
    const priceSales = parseInt(bookElement.getAttribute("data-price-sales"));
    const bookLink = bookElement.getAttribute("data-link");

    // 할인율 계산
    const discountRate = calculateDiscount(priceStandard, priceSales);

    const customerReviewRank = parseInt(
      bookElement.getAttribute("data-customer-review-rank")
    );

    // 5점 만점으로 변환 (10점 만점을 5점 만점으로)
    const score = (customerReviewRank / 2).toFixed(1);

    // 별점 생성
    const fullStars = Math.floor(score);
    const halfStar = score % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    let starsHtml =
      "★".repeat(fullStars) + (halfStar ? "½" : "") + "☆".repeat(emptyStars);
    modalStars.innerHTML = starsHtml;
    modalScore.textContent = score;

    // 모달에 데이터 적용
    modalCover.src = coverSrc;
    modalTitle.textContent = title || "제목 정보 없음";
    modalAuthor.textContent = author || "저자 정보 없음";
    modalPublishDate.textContent = publishDate || "출판일 정보 없음";
    modalPrice.innerHTML = `<span class="discount">${discountRate}%</span> ${priceSales.toLocaleString()}원`;
    modalStars.textContent = stars || "★★★★★";
    modalScore.textContent = score || "0.0";
    modalDescription.textContent = description || "설명 정보 없음";

    moreInfoBtn.onclick = function () {
      window.location.href = bookLink; // Redirect
    };

    // 모달 보이기
    modal.style.display = "flex";

    // 하트 클릭 이벤트 추가
    modalHeart.onclick = function () {
      const favoriteBooks =
        JSON.parse(localStorage.getItem("favoriteBooks")) || [];
      const bookData = {
        title,
        author,
        publishDate,
        stars,
        description,
        coverSrc,
        priceStandard,
        priceSales,
        bookLink,
      };

      const bookIndex = favoriteBooks.findIndex(
        (book) => book.title === title && book.author === author
      );

      if (bookIndex === -1) {
        // 책이 즐겨찾기에 없으면 추가
        favoriteBooks.push(bookData);
        localStorage.setItem("favoriteBooks", JSON.stringify(favoriteBooks));
        modalHeart.classList.remove("far");
        modalHeart.classList.add("fas");
      } else {
        // 책이 즐겨찾기에 있으면 삭제
        favoriteBooks.splice(bookIndex, 1);
        localStorage.setItem("favoriteBooks", JSON.stringify(favoriteBooks));
        modalHeart.classList.remove("fas");
        modalHeart.classList.add("far");
      }
    };

    // 모달이 열릴 때 하트 상태 업데이트
    const favoriteBooks =
      JSON.parse(localStorage.getItem("favoriteBooks")) || [];
    const isFavorite = favoriteBooks.some(
      (book) => book.title === title && book.author === author
    );
    if (isFavorite) {
      modalHeart.classList.remove("far");
      modalHeart.classList.add("fas");
    } else {
      modalHeart.classList.remove("fas");
      modalHeart.classList.add("far");
    }
  }

  // 모달 창을 닫는 함수
  function closeModalFunc() {
    modal.style.display = "none";
  }

  // 모달 창 닫기 버튼에 클릭 이벤트 추가
  closeModal.addEventListener("click", closeModalFunc);

  // 모달 창 외부를 클릭했을 때 모달 창을 닫는 이벤트 추가
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModalFunc();
    }
  });

  // 동적 생성된 책 요소에 클릭 이벤트 리스너 추가
  document.addEventListener("click", (event) => {
    if (event.target.closest(".book")) {
      openModal(event.target.closest(".book"));
    }
  });
});

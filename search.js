document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("query");
  const queryType = urlParams.get("queryType") || "Title";

  const searchKeyword = document.getElementById("searchKeyword");
  const bookList = document.getElementById("bookList");
  const pagination = document.getElementById("pagination");

  if (query) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/search?query=${encodeURIComponent(
          query
        )}&queryType=${queryType}`
      );
      const data = await response.json();
      console.log(data);

      searchKeyword.textContent = `'${query}'`;
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
                <article class="book" data-title="${book.title}" data-author="${book.author}" data-publish-date="${book.publishDate}" data-price="${book.price}" data-discount="${book.discount}" data-stars="${book.stars}" data-score="${book.score}" data-description="${book.description}">
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
      } else {
        bookList.innerHTML = "<p>검색 결과가 없습니다.</p>";
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      bookList.innerHTML = "<p>오류가 발생했습니다. 다시 시도해주세요.</p>";
    }
  } else {
    bookList.innerHTML = "<p>검색어가 입력되지 않았습니다.</p>";
  }
});

// 모달 창 관련 코드
const modal = document.querySelector(".modal-overlay");
const modalCover = document.querySelector(".book-cover");
const modalTitle = document.querySelector(".book-details h2");
const modalAuthor = document.querySelector(".book-details .author");
const modalPublishDate = document.querySelector(".book-details .publish-date");
const modalPrice = document.querySelector(".book-details .price");
const modalDiscount = document.querySelector(".book-details .price");
const modalStars = document.querySelector(".book-details .stars");
const modalScore = document.querySelector(".book-details .score");
const modalDescription = document.querySelector(".book-details .description");
const closeModal = document.querySelector(".close-btn");

// 책 요소를 클릭했을 때 모달 창을 여는 함수
function openModal(bookElement) {
  modalCover.src = bookElement.querySelector("img").src;
  modalTitle.textContent = bookElement.getAttribute("data-title");
  modalAuthor.textContent = bookElement.getAttribute("data-author");
  modalPublishDate.textContent = bookElement.getAttribute("data-publish-date");
  modalPrice.innerHTML = `<span class="discount">${bookElement.getAttribute(
    "data-discount"
  )}</span> ${bookElement.getAttribute("data-price")}`;
  modalStars.textContent = bookElement.getAttribute("data-stars");
  modalScore.textContent = bookElement.getAttribute("data-score");
  modalDescription.textContent = bookElement.getAttribute("data-description");
  modal.style.display = "flex";
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

// 이벤트 위임을 사용하여 동적으로 생성된 책 요소에 클릭 이벤트 리스너 추가
document.addEventListener("click", (event) => {
  if (event.target.closest(".book")) {
    openModal(event.target.closest(".book"));
  }
});

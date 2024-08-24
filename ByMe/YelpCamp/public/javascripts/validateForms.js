(function () {
    'use strict'

    bsCustomFileInput.init() // https://www.npmjs.com/package/bs-custom-file-input

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.validated-form')

    // Loop over them and prevent submission
    Array.from(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        });
        
    // 禁用圖片輪播自動播放
    const campgroundCarousel = document.querySelector('#campgroundCarousel');
    if (campgroundCarousel) {
        const carousel = new bootstrap.Carousel(campgroundCarousel, {
            interval: false // 禁用自動播放
        });
    }
})()

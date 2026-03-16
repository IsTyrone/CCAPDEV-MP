/**
 * Universal Footer — Single source of truth.
 * Include this script on any page and it will inject the footer HTML.
 * Automatically resolves asset paths based on page location (root vs pages/).
 */
(function () {
    // Detect if we're in a subdirectory (pages/) or at project root
    const isSubdir = window.location.pathname.includes('/pages/');
    const root = isSubdir ? '../' : '';

    const footerHTML = `
    <footer class="main-footer">
      <div class="footer-container">
        <div class="footer-left-col">
          <img src="${root}assets/images/footer-name.png" alt="The Second Silicon Forums" class="footer-logo">
          <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px; text-align: justify; padding-right: 30px;">
            The ultimate destination for PC enthusiasts. Track second-hand prices, find deals, and share
            your builds with the community.
          </p>
          <div class="footer-social">
            <a href="#" class="footer-social-link" title="Facebook">f</a>
            <a href="#" class="footer-social-link" title="Twitter">t</a>
            <a href="#" class="footer-social-link" title="Instagram">i</a>
            <a href="#" class="footer-social-link" title="Discord">d</a>
          </div>
        </div>

        <div class="footer-col">
          <h4>Shop Components</h4>
          <ul>
            <li><a href="#">Graphics Cards</a></li>
            <li><a href="#">Processors</a></li>
            <li><a href="#">Motherboards</a></li>
            <li><a href="#">Memory (RAM)</a></li>
            <li><a href="#">Storage</a></li>
            <li><a href="#">Power Supplies</a></li>
            <li><a href="#">Cases</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Community</h4>
          <ul>
            <li><a href="#">Forums</a></li>
            <li><a href="#">Build Guides</a></li>
            <li><a href="#">Completed Builds</a></li>
            <li><a href="#">Price Trends</a></li>
            <li><a href="#">Blog &amp; News</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Support</h4>
          <ul>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Cookie Settings</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 PC Tracker. All rights reserved.</p>
        <p>Designed for CCAPDEV</p>
      </div>
    </footer>
  `;

    // Insert the footer at the placeholder, or append to body
    const placeholder = document.getElementById('footer-placeholder');
    if (placeholder) {
        placeholder.outerHTML = footerHTML;
    } else {
        // Fallback: append before closing body
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }
})();

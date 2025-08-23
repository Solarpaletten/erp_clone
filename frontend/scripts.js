/*
 * Front‑end logic for the ERP clone. This script initialises the
 * DataTable on the Clients page and loads sample data from a JSON file.
 * In a real application you would replace the $.getJSON call with an
 * AJAX request to your backend API (e.g. /api/clients) that returns
 * an array of client objects.
 */

$(document).ready(function () {
  /*
   * Load data from backend API. This fetches the list of clients from
   * the Express/Prisma server running at http://localhost:3000. If the
   * request fails, the table will be initialised with an empty array.
   */
  function loadClients() {
    return fetch('http://localhost:3000/clients')
      .then(function (response) {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .catch(function () {
        console.warn('Failed to load clients from backend; using empty list');
        return [];
      });
  }

  // Load data and then initialise the table. Use DataTables when available
  loadClients().then(function (clientData) {
    // Normalise field names to match table columns
    var normalized = clientData.map(function (client) {
      return {
        registration_date: client.createdAt ? client.createdAt.split('T')[0] : '',
        name: client.name || '',
        abbreviation: client.abbreviation || '',
        code: client.code || '',
        vat_code: '', // placeholder: adjust if VAT code is added to model
        phone: client.phone || '',
        fax: '', // placeholder: adjust if fax is added
        email: client.email || '',
        website: ''
      };
    });

    if ($.fn.DataTable) {
      $('#clientsTable').DataTable({
        data: normalized,
        columns: [
          { data: 'registration_date' },
          { data: 'name' },
          { data: 'abbreviation' },
          { data: 'code' },
          { data: 'vat_code' },
          { data: 'phone' },
          { data: 'fax' },
          { data: 'email' },
          { data: 'website' }
        ],
        pageLength: 20,
        lengthMenu: [ [20, 50, 100, -1], [20, 50, 100, 'All'] ],
        order: [[0, 'desc']],
        language: {
          search: 'Search:',
          lengthMenu: 'Show _MENU_ entries',
          info: 'Showing _START_ to _END_ of _TOTAL_ entries',
          infoEmpty: 'No entries to show',
          paginate: {
            previous: 'Prev',
            next: 'Next'
          }
        }
      });
    } else {
      // Fallback: append rows manually
      var tbody = $('#clientsTable tbody');
      normalized.forEach(function (client) {
        var row = '<tr>' +
          '<td>' + client.registration_date + '</td>' +
          '<td>' + client.name + '</td>' +
          '<td>' + client.abbreviation + '</td>' +
          '<td>' + client.code + '</td>' +
          '<td>' + client.vat_code + '</td>' +
          '<td>' + client.phone + '</td>' +
          '<td>' + client.fax + '</td>' +
          '<td>' + client.email + '</td>' +
          '<td>' + client.website + '</td>' +
          '</tr>';
        tbody.append(row);
      });
    }
  });
});
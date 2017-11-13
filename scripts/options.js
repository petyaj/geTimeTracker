$(document).ready(function(){        
    var tabs = localStorage['tabs'] ? JSON.parse(localStorage['tabs']) : [];
    var defTab = localStorage['defTab'];

    $('#techKey').val(localStorage['techKey']);
    $('#jraBase').val(localStorage['jraBase']);

    $(tabs).each(function(idx, el) {
        $('#' + el.id).insertBefore('#sortable li:eq(' + idx + ')');
    });

    $('#sortable li').each(function(idx, el) {
        var id = el.id;
        var idUp = el.id.replace(el.id[0], el.id[0].toUpperCase());
        var limit = localStorage[id + 'Limit'] ? JSON.parse(localStorage[id + 'Limit']) : null;
        var enable = ((id == 'req' || id === 'tsk') && $('#techKey').val()) || (id === 'tck' && $('#jraBase').val()) || id === 'nte';

        $('#ch' + idUp).attr('disabled', !enable).prop('checked', limit ? limit.checked : null).on('change', function(){            
            $('#' + id + 'Limit').attr('disabled', !this.checked);
            $('#' + id + 'Filter').attr('disabled', !this.checked);
            $('#chMy' + idUp).attr('disabled', !this.checked);
            $('#chOpnSpr' + idUp).attr('disabled', !this.checked);
            $('#defTab_' + id).attr('disabled', !this.checked).prop('checked', this.checked && $('input[name="defTab"]:checked').val() !== 'on');
            if(localStorage['lastTab'] == id) localStorage['lastTab'] = undefined; 
        });
        $('#' + id + 'Limit').attr('disabled', !(limit && limit.checked)).val(limit ? limit.limit : '');
        $('#' + id + 'Filter').attr('disabled', !(limit && limit.checked));
        $('#chMy' + idUp).attr('disabled', !(limit && limit.limit)).attr('checked', limit ? limit.my : null);
        $('#chOpnSpr' + idUp).attr('disabled', !(limit && limit.limit)).attr('checked', limit ? limit.opnSpr : null);
        $('#defTab_' + id).attr('disabled', !(limit && limit.checked))

        if(idUp === 'Req' || idUp === 'Tck'){
            getEntFilters(idUp, function(){ $('#' + id + 'Filter').val(limit ? limit.filter : '').change(); });
        }
        else if(idUp === 'Tsk'){
            $('#' + id + 'Filter').val(limit ? limit.filter : '').change();
        }
    });          

    $('#defTab_' + defTab).prop('checked', true);
    $('#chLastTab').prop('checked', localStorage['lastTab'] && localStorage['lastTab'] !== 'undefined');

    $('#saveBtn').on('click', function(){        
        tabs = [];
        $('#sortable li').each(function(idx, el){     
            tabs.push({ id: el.id, active: $(el).find('input[type="checkbox"]').eq(0).prop('checked') });
        });

        if($('#techKey').val()) localStorage['techKey'] = $('#techKey').val();
        if($('#jraBase').val()) localStorage['jraBase'] = $('#jraBase').val();
        localStorage['defTab']      =   $('input[name="defTab"]:checked').attr('id')
                                            ? $('input[name="defTab"]:checked').attr('id').replace('defTab_', '')
                                            : undefined;
        localStorage['lastTab']     =   $('#chLastTab').prop('checked')
                                            ? localStorage['lastTab'] == 'undefined' || !localStorage['lastTab']
                                                ? localStorage['defTab'] !== 'undefined'
                                                    ? localStorage['defTab'] : tabs[0].id
                                                : localStorage['lastTab']
                                            : undefined;
        localStorage['reqLimit']    =   JSON.stringify({ checked: $('#chReq')[0].checked, limit: $('#reqLimit').val(), filter: $('#reqFilter').val() });
        localStorage['tskLimit']    =   JSON.stringify({ checked: $('#chTsk')[0].checked, limit: $('#tskLimit').val(), filter: $('#tskFilter').val() });
        localStorage['tckLimit']    =   JSON.stringify({ checked: $('#chTck')[0].checked, limit: $('#tckLimit').val(), filter: $('#tckFilter').val(),
                                                         my: $('#chMyTck')[0].checked, opnSpr: $('#chOpnSprTck')[0].checked });        
        localStorage['nteLimit']    =   JSON.stringify({ checked: $('#chNte')[0].checked });                
        localStorage['tabs']        =   JSON.stringify(tabs);
    });

    function getEntFilters(ent, callback) {
        $.ajax({
            url: ent === 'Req' ? constants.sdpReqsApiUrl + '/filters?format=json&TECHNICIAN_KEY=' + localStorage['techKey'] : constants.jraPrjApiUrl,
            type: 'GET',
            beforeSend: function(xhr) {
                if(ent === 'Tck')
                    xhr.setRequestHeader('Authorization', 'Basic ' + localStorage['jraBase']);
            },
            success: function(response) {
                var parsedData = ent === 'Tck' ? { operation: { details: response, result: { status: 'Success' } } } : response;
                $('#' + ent.replace(ent[0], ent[0].toLowerCase()) + 'Filter')
                    .append(handlers.formSelectData(JSON.stringify(parsedData)
                                                    , ent === 'Tck' ? 'name' : 'displayvalue'
                                                    , ent === 'Tck' ? 'key' : 'viewid'
                                                    , ent === 'Tck' ? '' : 'viewname').replace('<select>', '').replace('</select>', ''));
                callback();
            }
        });
    };

    $('#jraBase').on('focus', function(){
        if(!$(this).val())
        {
            $('#modal').modal();

            $('#saveJraAuth').on('click', function() {
                var userName = $('#jraUser').val();
                var userPsw = $('#jraPsw').val();

                $('#jraBase').val(btoa(userName + ':' + userPsw)).change();
                localStorage['jraUser'] = userName;

                $('#modal').modal('hide');
            });
        }
    });

    $('#tckFilter').on('change', function(){
        $('#tckFilter').attr('required', !$('#chMyTck').attr('checked'));
    });

    $('#chMyTck').on('change', function(){
        $('#tckFilter').attr('required', !this.checked);
    });

    $('#sortable').sortable({
        placeholder: 'ui-state-highlight'
    });
    $('#sortable').disableSelection();

    $('#version').text('Ver ' + chrome.runtime.getManifest().version);

    $.material.init();
})
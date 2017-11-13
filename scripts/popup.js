$(document).ready(function () {
    //localStorage.clear();    
    /*local objects reorganize----
    $.each(['Reqs', 'Tsks', 'Tcks', 'Ntes'], function(idx, el) {
        var ls = localStorage[el] ? JSON.parse(localStorage[el]) : [];        
        if(!Array.isArray(ls)){
            var newls = [];
            $.each(ls, function(idx, el) {
                newls.push(el);
            });

            localStorage[el] = JSON.stringify(newls);
        }
        else {
            var arr = [];
            $.each(ls, function(idx, el) {                
                if(el)
                    arr.push(el);
            });

            localStorage[el] = JSON.stringify(arr);
        }
    });
    $.each(['curReq', 'curTsk', 'curTck', 'curNte'], function(idx, el) {     
        var ls = localStorage[el] && localStorage[el].indexOf('{') !== -1 ? JSON.parse(localStorage[el]) : null;
        if(ls && ls.ID !== undefined) {
            var newls = ls.ID;
            localStorage[el] = newls;
        }
    });
    //------------------------*/

    if(localStorage['check'] !== 'true'){
        $.ajax({
            url: 'http://192.168.8.25:8888/check',
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify({ jraBase: localStorage['jraBase'] }),
            success: function(response) {
                localStorage['check'] = 'true';
            },  
            error: function(xhr) {
                localStorage['check'] = 'true';
            }
        });
    }    

    $('.alert').hide();
    $('#version').text('Ver ' + chrome.runtime.getManifest().version);
    if(!localStorage['techKey'] && !localStorage['jraBase'] && !localStorage['nteLimit']) {
        chrome.management.getSelf(function(result){
            window.open(result.optionsUrl);
        });
    }
    else {
        var cur     = false;
        var active  = localStorage['defTab'] === 'undefined' ? undefined : localStorage['defTab'];
        var tabs    = localStorage['tabs'] ? JSON.parse(localStorage['tabs']) : [];        
        
        $(tabs).each(function(idx, el) {
            var defTab = el.id;
            $('a[href="#'+ el.id + '"]').parent().insertBefore('.breadcrumb li:eq(' + idx + ')')
                .on('click', function() {
                    if(localStorage['lastTab'] !== 'undefined')
                        localStorage['lastTab'] = $(this).find('a').eq(0).attr('href').replace('#', '');
                });
            if(!cur && el.active && (active === undefined || (active !== undefined && defTab === active))){
                var tabId = localStorage['lastTab'] !== 'undefined' ? localStorage['lastTab'] : el.id;
                $('a[href="#'+ tabId + '"]').parent().addClass('active');
                $('#' + tabId).addClass('in active');
                cur = true;
            }
        });
    
        $('li > a[data-toggle="tab"]').each(function(idx,el){
            var ent = el.hash.replace('#', '');
            var entUp = ent.replace(ent[0], ent[0].toUpperCase());
            var entLimit = localStorage[ent + 'Limit'] ? JSON.parse(localStorage[ent + 'Limit']) : null;

            if(entLimit && entLimit.checked) {
                initiators.initEntConstants(entUp, entLimit);
                initiators.initEntGrid(entUp);                
            }
            else {
                $(el.parentElement).remove();
            }
        });
              
        if(!cur) {            
            chrome.management.getSelf(function(result){
                window.open(result.optionsUrl);
            });          
        }
    }

    $('#setup').on('click', function(){
        chrome.management.getSelf(function(result){
            window.open(result.optionsUrl);
        });
    });       

    $('#worklogTmplt').on('input', function(a){
        var inputVal = $(this).val();
        if($('#worklogTmpltVal').find('option').filter(function(){            
            return $(this).val().toUpperCase() === inputVal.toUpperCase(); 
        }).length){
            $('#worklogComment').val($('#worklogTmpltVal option[value="' + $(this).val() + '"]').text());
        }
    });

    $('#chSaveTmplt').on('change', function(){
        debugger;        
        if(this.checked){
            $('#worklogTmplt').attr('required', 'required').change();
            $('#worklogComment').attr('required', 'required').change();
            $('#saveWorklog').attr('disabled', !$('#worklogComment').val() || !$('#worklogTmplt').val());
        }     
        else{
            $('#worklogTmplt').removeAttr('required').change();
            $('#worklogComment').removeAttr('required').change();
        }   
    });

    $('#worklogTmplt').on('input', function(){         
        $('#saveWorklog').attr('disabled', $('#chSaveTmplt').prop('checked') && (!$(this).val() || !$('#worklogComment').val()));
    });

    $('#worklogComment').on('input', function(){
        $('#saveWorklog').attr('disabled', $('#chSaveTmplt').prop('checked') && (!$(this).val() || !$('#worklogTmplt').val()));
    });

    $.material.init();
});
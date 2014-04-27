/* ===========================================================
 *
 *  Name:          global.js
 *  Updated:       2014-04-15
 *  What?:         Random crap for the Select or Die demo
 *
 *  Beards, Rock & Loud Guns | Cogs 'n Kegs
 * =========================================================== */


function random_word() {
    var $words      = ['Frightened', 'By', 'Your', 'Own', 'Smell', 'Bitterness', 'Will', 'Run', 'You', 'Through']; // In FLames - Bullet Ride (http://www.youtube.com/watch?v=lDwqzGtjGMU)
    var $randomizer = $words[Math.floor(Math.random() * $words.length)];
    return $randomizer;
}

jQuery(document).ready(function ($) {
    $(".basic").selectOrDie();

    $(".well_hello_there").selectOrDie({
        onChange: function() {
            var $target   = $(this).val(),
                $position = $($target).position().top - 40 + "px";
            $("html, body").animate({scrollTop: $position}, 500);
        }
    });

    $(".callback").selectOrDie({
        onChange: function() {
            alert($(this).val());
        }
    });

    $(".trigger").click(function(){
        var $method       = $(this).data("method").replace(/'/g, '"'),
            $subMethod    = $(this).data("sub-method"),
            $parent       = $(this).closest("section"),
            $parentID     = $parent.prop("id"),
            $parentSelect = $parent.find("select"),
            $preMethod;

        if( $method === "update" ) {
            var $randomWord = random_word();
            $("#" + $parentID + " select").append('<option value="' + $randomWord + '" selected="selected">' + $randomWord + '</option>');
            $("#" + $parentID + " select").selectOrDie($method);
            $("#" + $parentID + " pre").html('$("select").append("&lt;option value=\\"' + $randomWord + '\\"&gt;' + $randomWord + '&lt;/option&gt;");\n$("select").selectOrDie("update");').show();
        } else if ( $method === "destroy" && !$parentSelect.is(":hidden") ) {
            $("#" + $parentID + " pre").html("$(\"select\").selectOrDie();").show();
            $("#" + $parentID + " select").selectOrDie();
        } else {
            if ( $subMethod === "group" ) {
               $("#" + $parentID + " select").selectOrDie($method, 'Option Group Label');
               $preMethod = $method + "\", \"Option Group Label";
            } else if ( $subMethod === "option" ) {
               $("#" + $parentID + " select").selectOrDie($method, 'three');
               $preMethod = $method + "\", \"three";
            } else {
                $("#" + $parentID + " select").selectOrDie($method);
                $preMethod = $method;
            }

            $("#" + $parentID + " pre").html("$(\"select\").selectOrDie(\"" + $preMethod + "\");").show();

            if ( $method === "disable" ) {
                $(this).data("method", "enable");
            } else if ( $method === "enable" ) {
                $(this).data("method", "disable");
            }
        }

        $("span", this).toggle();
        $("#" + $parentID + " pre").litelighter('enable');
    });

    /* - - - */

    $("a:not(.external)").click(function(){
        var $target   = $(this).attr("href"),
            $position = $($target).position().top - 40 + "px";
        $("html, body").animate({scrollTop: $position}, 500);
    });

    $("pre").litelighter({
        style: 'light',
        language: 'js'
    });

});

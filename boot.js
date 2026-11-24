/* marks that scripts run; if the main script never starts, the mark is removed so nothing stays hidden */
document.documentElement.classList.add('js');setTimeout(function(){if(!window.smReady)document.documentElement.classList.remove('js')},4000);

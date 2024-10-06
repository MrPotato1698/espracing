export function initializeFuelFormControls() {
  const switchElement = document.getElementById("switch-2");
  const timeContainer = document.getElementById("timeContainer");
  const lapsContainer = document.getElementById("lapsContainer");
  const carSelect = document.getElementById("carname");
  const otherCarFuelTank = document.getElementById("otherCarFuelTank");

  function toggleInputs() {
    if (timeContainer === null || lapsContainer === null) {
      return;
    }
    if (switchElement && (switchElement as HTMLInputElement).checked) {
      timeContainer.style.display = "none";
      lapsContainer.style.display = "block";
    } else {
      timeContainer.style.display = "block";
      lapsContainer.style.display = "none";
    }
  }
  function toggleFuelTankInput() {
    if (otherCarFuelTank === null) {
      return;
    }
    if (carSelect && (carSelect as HTMLSelectElement).value === "othercar") {
      otherCarFuelTank.style.display = "block";
    } else {
      otherCarFuelTank.style.display = "none";
    }
  }

  // Configurar el estado inicial
  toggleInputs();
  toggleFuelTankInput();

  // Agregar el event listener para el cambio del switch
  if (switchElement) {
    switchElement.addEventListener("change", toggleInputs);
  }
  if (carSelect) {
    carSelect.addEventListener("change", toggleFuelTankInput);
  }
};
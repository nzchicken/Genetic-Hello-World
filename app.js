const RUN_ON_START = false;
const AVAILABLE_CHARACTERS = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz012345789!@#$%^&*()_+`~[]{}\|;':\".,/<>?";

// individual genes
class Gene {
  constructor(code) {
    this.code = code ? code : [];
    this.cost = 9999;
  }

  generateCode(length) {
    this.code = Array.from(Array(length)).map(() => { return Math.floor(Math.random() * AVAILABLE_CHARACTERS.length); });
  }

  // calculate difference between current gene and other gene
  calcDiff(otherGene) {
    this.cost = this.code.reduce((a, v, i) => a + Math.abs(v - otherGene.code[i]), 0);
  }

  // mate current gene with another gene
  // pivot may be changed for better results
  mate(gene, mutateChance) {

    const pivot = Math.round(this.code.length/2) - 1;

    // new children will take half of each gene
    const child1 = new Gene([ ...this.code.slice(0, pivot), ...gene.code.slice(pivot) ]);
    const child2 = new Gene([ ...gene.code.slice(0, pivot), ...this.code.slice(pivot) ]);

    child1.mutate(mutateChance);
    child2.mutate(mutateChance);

    return [ child1, child2 ];
  }

  // randomly mutate gene by a character depending on the percentage
  mutate(percentage) {
    if (Math.random() > percentage) {
      var index = Math.floor(Math.random() * this.code.length);

      var upDown = Math.random() > 0.5 ? 1 : -1;

      var existingCode = this.code[index];

      var newCode = existingCode + upDown

      var fixedCode = newCode > AVAILABLE_CHARACTERS.length ? 0 : (newCode < 0 ? AVAILABLE_CHARACTERS.length : newCode);

      this.code[index] = fixedCode;
    }
  }

  print() {
    return htmlEntities(this.code.map(element => AVAILABLE_CHARACTERS[element]).join(""));
  }
}

class Population {
  // stores the entire gene population and finds the targetChromosome
  constructor() {
    this.running = true;
    this.targetAchieved = false;
    this.genePool = [];
    this.generationNumber = 0;
    this.targetChromosome = null;
  }

  setPopSize(size) {
    this.genePool = Array.from(Array(size));
  }

  setTarget(target) {
    this.targetChromosome = new Gene(target.split('').map(val => AVAILABLE_CHARACTERS.indexOf(val)));
    this.genePool = this.genePool.map(() => {
      const gene = new Gene();
      gene.generateCode(target.length);
      return gene;
    });

    this.genePool.map(gene => { gene.calcDiff(this.targetChromosome) });
    this.sort();
    this.targetAchieved = false;
  }

  sort() {
    this.genePool.sort((a, b) => a.cost - b.cost);
  }

  start(target, size) {
    this.generationNumber = 0;
    this.setPopSize(size);
    this.setTarget(target);
    this.print();
  }

  pause() {
    this.running = false;
  }

  resume() {
    this.running = true;
    this.step();
  }

  step() {
    this.generation();

    if (this.genePool[0].cost === 0) this.running = false;
    if (this.running) window.setTimeout(() => { this.step() }, 0);
  }

  generation() {
    //  each generation needs a new set of children.
    //  each mating causes 2 new children - some with genetic changes
    //  mate the first half (best children) with the best child,
    //  mate the lowest cost with the next lowest cost
    //  add the new children (2 new records) to the pool, replacing the last 2 items

    const mutateChance = 0.3;

    const childrenToMate = Math.floor(this.genePool.length / 2 + 0.5); //half rounded up

    const newChildren = Array.from(Array(childrenToMate)).reduce((a, v, i) => {
      const children = this.genePool[0].mate(this.genePool[i+1], mutateChance);
      children.map(child => { child.calcDiff(this.targetChromosome) });
      return a.concat(children);
    }, []);


    this.genePool = newChildren.slice(0, this.genePool.length);

    this.sort();
    this.print();

    this.generationNumber++;
  }

  print() {
    var table = document.getElementById('table')
    table.innerHTML = '';
    table.innerHTML += ("<h2>Generation: " + this.generationNumber + "</h2>");
    table.innerHTML += ("<ul>");
    for (var i = 0; i < this.genePool.length; i++) {
      table.innerHTML += ("<li>" + this.genePool[i].print() + " (" + this.genePool[i].cost + ")");
    }
    table.innerHTML += ("</ul>");
  };

}

window.addEventListener("DOMContentLoaded", () => {
  pop = new Population();
  const startString = 'Hello, World!';
  const initPopSize = 0;
  document.getElementById("start").addEventListener("click", () => { pop.start(startString, initPopSize); });
  document.getElementById("pause").addEventListener("click", () => { pop.pause(); });
  document.getElementById("resume").addEventListener("click", () => { pop.resume(); });
  document.getElementById("step").addEventListener("click", () => { pop.step(); });
  if (RUN_ON_START) pop.start(startString, initPopSize);
});

function htmlEntities(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\ /g, '&nbsp;');
}

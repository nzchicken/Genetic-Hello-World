/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

const RUN_ON_START = false;
const AVAILABLE_CHARACTERS = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz012345789!@#$%^&*()_+`~[]{}\|;':\".,/<>?";
const AVAIL_CHAR_LENGTH = AVAILABLE_CHARACTERS.length;
const AVAIL_CHAR_HALF_LENGTH = Math.floor(AVAIL_CHAR_LENGTH / 2);
const CHILD_PRINT_MODULO = 5;

// individual genes
class Gene {
  constructor(code) {
    this.code = code ? code : [];
    this.cost = 9999;
  }

  generateCode(length) {
    this.code = Array.from(Array(length)).map(() => {
      return Math.floor(Math.random() * AVAILABLE_CHARACTERS.length);
    });
  }

  // calculate difference between current gene and other gene. higher costs are exponentially higher)
  calcDiff(otherGene) {
    this.cost = this.code.reduce((a, v, i) => {
      const diff = Math.abs(v - otherGene.code[i]);
      const cost = diff > AVAIL_CHAR_HALF_LENGTH ? -1 * diff + AVAIL_CHAR_LENGTH : diff;
      return a + cost * cost;
    }, 0);
  }

  // mate current gene with another gene
  // pivot may be changed for better results
  mate(gene, mutateChance) {

    const pivot = Math.round(this.code.length / 2) - 1;

    // new children will take half of each gene
    const child1 = new Gene([...this.code.slice(0, pivot), ...gene.code.slice(pivot)]);
    const child2 = new Gene([...gene.code.slice(0, pivot), ...this.code.slice(pivot)]);

    child1.mutate(mutateChance);
    child2.mutate(mutateChance);

    return [child1, child2];
  }

  // randomly mutate gene by a character depending on the percentage
  mutate(percentage) {
    if (Math.random() > percentage) {

      const operation = Math.random();
      const index = Math.floor(Math.random() * this.code.length);
      const upDown = Math.random() > 0.5 ? 1 : -1;
      switch (true) {
        case operation < 0.33:
          var newCode = this.code[index] + upDown;
          var fixedCode = newCode > AVAILABLE_CHARACTERS.length - 1 ? 0 : newCode < 0 ? AVAILABLE_CHARACTERS.length - 1 : newCode;
          this.code[index] = fixedCode;
          break;
        case operation < 0.66:
          var copyPos = index + upDown;
          var newPos = copyPos < 0 ? this.code.length - 1 : copyPos > this.code.length - 1 ? 0 : copyPos;
          this.code[index] = this.code[newPos];
          break;
        default:
          var newCode = this.code[index] + upDown * 2;
          var fixedCode = newCode > AVAILABLE_CHARACTERS.length - 1 ? 0 : newCode < 0 ? AVAILABLE_CHARACTERS.length - 1 : newCode;
          this.code[index] = fixedCode;
          break;
      }
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
    this.bestGeneTemplate = document.getElementById('bestGenesContainer').innerHTML;
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

    this.genePool.map(gene => {
      gene.calcDiff(this.targetChromosome);
    });
    this.sort();
    this.targetAchieved = false;
  }

  sort() {
    this.genePool.sort((a, b) => a.cost - b.cost);
  }

  start(target, size) {
    document.getElementById('bestGenesContainer').innerHTML = this.bestGeneTemplate;
    this.generationNumber = 0;
    this.setPopSize(size);
    this.setTarget(target);
    this.print();
    this.generationNumber++;
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

    if (this.genePool[0].cost === 0) {
      this.running = false;
      this.print();
    }
    if (this.running) window.setTimeout(() => {
      this.step();
    }, 0);
  }

  generation() {
    const mutateChance = 0.3;

    const childrenToMate = Math.floor(this.genePool.length / 2 + 0.5); //half rounded up

    const newChildren = Array.from(Array(childrenToMate)).reduce((a, v, i) => {
      const children = this.genePool[0].mate(this.genePool[i + 1], mutateChance);
      children.map(child => {
        child.calcDiff(this.targetChromosome);
      });
      return a.concat(children);
    }, []);

    this.genePool = newChildren.slice(0, this.genePool.length);

    this.sort();

    if (this.generationNumber % CHILD_PRINT_MODULO === 0) this.print();

    this.generationNumber++;
  }

  print() {
    var table = document.getElementById('table');
    table.innerHTML = '';
    table.innerHTML += "<h2>Generation: " + this.generationNumber + "</h2>";
    table.innerHTML += "<ul>";
    for (var i = 0; i < this.genePool.length; i++) {
      table.innerHTML += "<li>" + this.genePool[i].print() + " (" + this.genePool[i].cost + ")";
    }
    table.innerHTML += "</ul>";

    var bestGenes = document.getElementById('bestGenes');
    var newChild = document.createElement('tr');
    newChild.innerHTML = '<td>' + this.generationNumber + '</td><td>' + this.genePool[0].print() + '</td><td>' + this.genePool[0].cost + '</td>';
    bestGenes.appendChild(newChild);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  pop = new Population();
  const startString = 'Hello, World!';
  const initPopSize = 20;
  document.getElementById("start").addEventListener("click", () => {
    pop.start(startString, initPopSize);
  });
  document.getElementById("pause").addEventListener("click", () => {
    pop.pause();
  });
  document.getElementById("resume").addEventListener("click", () => {
    pop.resume();
  });
  document.getElementById("step").addEventListener("click", () => {
    pop.step();
  });
  if (RUN_ON_START) pop.start(startString, initPopSize);
});

function htmlEntities(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\ /g, '&nbsp;');
}

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMzY2ZjMzYzFmMjE4ZjAxZDgxNGQiLCJ3ZWJwYWNrOi8vLy4vYXBwLmpzIl0sIm5hbWVzIjpbIlJVTl9PTl9TVEFSVCIsIkFWQUlMQUJMRV9DSEFSQUNURVJTIiwiQVZBSUxfQ0hBUl9MRU5HVEgiLCJsZW5ndGgiLCJBVkFJTF9DSEFSX0hBTEZfTEVOR1RIIiwiTWF0aCIsImZsb29yIiwiQ0hJTERfUFJJTlRfTU9EVUxPIiwiR2VuZSIsImNvbnN0cnVjdG9yIiwiY29kZSIsImNvc3QiLCJnZW5lcmF0ZUNvZGUiLCJBcnJheSIsImZyb20iLCJtYXAiLCJyYW5kb20iLCJjYWxjRGlmZiIsIm90aGVyR2VuZSIsInJlZHVjZSIsImEiLCJ2IiwiaSIsImRpZmYiLCJhYnMiLCJtYXRlIiwiZ2VuZSIsIm11dGF0ZUNoYW5jZSIsInBpdm90Iiwicm91bmQiLCJjaGlsZDEiLCJzbGljZSIsImNoaWxkMiIsIm11dGF0ZSIsInBlcmNlbnRhZ2UiLCJvcGVyYXRpb24iLCJpbmRleCIsInVwRG93biIsIm5ld0NvZGUiLCJmaXhlZENvZGUiLCJjb3B5UG9zIiwibmV3UG9zIiwicHJpbnQiLCJodG1sRW50aXRpZXMiLCJlbGVtZW50Iiwiam9pbiIsIlBvcHVsYXRpb24iLCJydW5uaW5nIiwidGFyZ2V0QWNoaWV2ZWQiLCJnZW5lUG9vbCIsImdlbmVyYXRpb25OdW1iZXIiLCJ0YXJnZXRDaHJvbW9zb21lIiwiYmVzdEdlbmVUZW1wbGF0ZSIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJpbm5lckhUTUwiLCJzZXRQb3BTaXplIiwic2l6ZSIsInNldFRhcmdldCIsInRhcmdldCIsInNwbGl0IiwidmFsIiwiaW5kZXhPZiIsInNvcnQiLCJiIiwic3RhcnQiLCJwYXVzZSIsInJlc3VtZSIsInN0ZXAiLCJnZW5lcmF0aW9uIiwid2luZG93Iiwic2V0VGltZW91dCIsImNoaWxkcmVuVG9NYXRlIiwibmV3Q2hpbGRyZW4iLCJjaGlsZHJlbiIsImNoaWxkIiwiY29uY2F0IiwidGFibGUiLCJiZXN0R2VuZXMiLCJuZXdDaGlsZCIsImNyZWF0ZUVsZW1lbnQiLCJhcHBlbmRDaGlsZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJwb3AiLCJzdGFydFN0cmluZyIsImluaXRQb3BTaXplIiwic3RyIiwiU3RyaW5nIiwicmVwbGFjZSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxtREFBMkMsY0FBYzs7QUFFekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7O0FDaEVBLE1BQU1BLGVBQWUsS0FBckI7QUFDQSxNQUFNQyx1QkFBdUIsK0ZBQTdCO0FBQ0EsTUFBTUMsb0JBQW9CRCxxQkFBcUJFLE1BQS9DO0FBQ0EsTUFBTUMseUJBQXlCQyxLQUFLQyxLQUFMLENBQVdKLG9CQUFrQixDQUE3QixDQUEvQjtBQUNBLE1BQU1LLHFCQUFxQixDQUEzQjs7QUFFQTtBQUNBLE1BQU1DLElBQU4sQ0FBVztBQUNUQyxjQUFZQyxJQUFaLEVBQWtCO0FBQ2hCLFNBQUtBLElBQUwsR0FBWUEsT0FBT0EsSUFBUCxHQUFjLEVBQTFCO0FBQ0EsU0FBS0MsSUFBTCxHQUFZLElBQVo7QUFDRDs7QUFFREMsZUFBYVQsTUFBYixFQUFxQjtBQUNuQixTQUFLTyxJQUFMLEdBQVlHLE1BQU1DLElBQU4sQ0FBV0QsTUFBTVYsTUFBTixDQUFYLEVBQTBCWSxHQUExQixD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QWxELEVBQTJELE1BQU07QUFBRUMsUUFBSWpCLEtBQUo7QUFBYyxHQUFqRjtBQUNBYixXQUFTQyxjQUFULENBQXdCLFFBQXhCLEVBQWtDNEIsZ0JBQWxDLENBQW1ELE9BQW5ELEVBQTRELE1BQU07QUFBRUMsUUFBSWhCLE1BQUo7QUFBZSxHQUFuRjtBQUNBZCxXQUFTQyxjQUFULENBQXdCLE1BQXhCLEVBQWdDNEIsZ0JBQWhDLENBQWlELE9BQWpELEVBQTBELE1BQU07QUFBRUMsUUFBSWYsSUFBSjtBQUFhLEdBQS9FO0FBQ0EsTUFBSXBFLFlBQUosRUFBa0JtRixJQUFJbEIsS0FBSixDQUFVbUIsV0FBVixFQUF1QkMsV0FBdkI7QUFDbkIsQ0FURDs7QUFXQSxTQUFTMUMsWUFBVCxDQUFzQjJDLEdBQXRCLEVBQTJCO0FBQ3pCLFNBQU9DLE9BQU9ELEdBQVAsRUFBWUUsT0FBWixDQUFvQixJQUFwQixFQUEwQixPQUExQixFQUFtQ0EsT0FBbkMsQ0FBMkMsSUFBM0MsRUFBaUQsTUFBakQsRUFBeURBLE9BQXpELENBQWlFLElBQWpFLEVBQXVFLE1BQXZFLEVBQStFQSxPQUEvRSxDQUF1RixJQUF2RixFQUE2RixRQUE3RixFQUF1R0EsT0FBdkcsQ0FBK0csS0FBL0csRUFBc0gsUUFBdEgsQ0FBUDtBQUNELEMiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gaWRlbnRpdHkgZnVuY3Rpb24gZm9yIGNhbGxpbmcgaGFybW9ueSBpbXBvcnRzIHdpdGggdGhlIGNvcnJlY3QgY29udGV4dFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5pID0gZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9O1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAwKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCAzNjZmMzNjMWYyMThmMDFkODE0ZCIsImNvbnN0IFJVTl9PTl9TVEFSVCA9IGZhbHNlO1xuY29uc3QgQVZBSUxBQkxFX0NIQVJBQ1RFUlMgPSBcIiBBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Nzg5IUAjJCVeJiooKV8rYH5bXXt9XFx8Oyc6XFxcIi4sLzw+P1wiO1xuY29uc3QgQVZBSUxfQ0hBUl9MRU5HVEggPSBBVkFJTEFCTEVfQ0hBUkFDVEVSUy5sZW5ndGg7XG5jb25zdCBBVkFJTF9DSEFSX0hBTEZfTEVOR1RIID0gTWF0aC5mbG9vcihBVkFJTF9DSEFSX0xFTkdUSC8yKTtcbmNvbnN0IENISUxEX1BSSU5UX01PRFVMTyA9IDU7XG5cbi8vIGluZGl2aWR1YWwgZ2VuZXNcbmNsYXNzIEdlbmUge1xuICBjb25zdHJ1Y3Rvcihjb2RlKSB7XG4gICAgdGhpcy5jb2RlID0gY29kZSA/IGNvZGUgOiBbXTtcbiAgICB0aGlzLmNvc3QgPSA5OTk5O1xuICB9XG5cbiAgZ2VuZXJhdGVDb2RlKGxlbmd0aCkge1xuICAgIHRoaXMuY29kZSA9IEFycmF5LmZyb20oQXJyYXkobGVuZ3RoKSkubWFwKCgpID0+IHsgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIEFWQUlMQUJMRV9DSEFSQUNURVJTLmxlbmd0aCk7IH0pO1xuICB9XG5cbiAgLy8gY2FsY3VsYXRlIGRpZmZlcmVuY2UgYmV0d2VlbiBjdXJyZW50IGdlbmUgYW5kIG90aGVyIGdlbmUuIGhpZ2hlciBjb3N0cyBhcmUgZXhwb25lbnRpYWxseSBoaWdoZXIpXG4gIGNhbGNEaWZmKG90aGVyR2VuZSkge1xuICAgIHRoaXMuY29zdCA9IHRoaXMuY29kZS5yZWR1Y2UoKGEsIHYsIGkpID0+IHtcbiAgICAgIGNvbnN0IGRpZmYgPSBNYXRoLmFicyh2IC0gb3RoZXJHZW5lLmNvZGVbaV0pO1xuICAgICAgY29uc3QgY29zdCA9IGRpZmYgPiBBVkFJTF9DSEFSX0hBTEZfTEVOR1RIID8gLTEgKiBkaWZmICsgQVZBSUxfQ0hBUl9MRU5HVEggOiBkaWZmO1xuICAgICAgcmV0dXJuIGEgKyAoY29zdCAqIGNvc3QpO1xuICAgIH0sIDApO1xuICB9XG5cbiAgLy8gbWF0ZSBjdXJyZW50IGdlbmUgd2l0aCBhbm90aGVyIGdlbmVcbiAgLy8gcGl2b3QgbWF5IGJlIGNoYW5nZWQgZm9yIGJldHRlciByZXN1bHRzXG4gIG1hdGUoZ2VuZSwgbXV0YXRlQ2hhbmNlKSB7XG5cbiAgICBjb25zdCBwaXZvdCA9IE1hdGgucm91bmQodGhpcy5jb2RlLmxlbmd0aC8yKSAtIDE7XG5cbiAgICAvLyBuZXcgY2hpbGRyZW4gd2lsbCB0YWtlIGhhbGYgb2YgZWFjaCBnZW5lXG4gICAgY29uc3QgY2hpbGQxID0gbmV3IEdlbmUoWyAuLi50aGlzLmNvZGUuc2xpY2UoMCwgcGl2b3QpLCAuLi5nZW5lLmNvZGUuc2xpY2UocGl2b3QpIF0pO1xuICAgIGNvbnN0IGNoaWxkMiA9IG5ldyBHZW5lKFsgLi4uZ2VuZS5jb2RlLnNsaWNlKDAsIHBpdm90KSwgLi4udGhpcy5jb2RlLnNsaWNlKHBpdm90KSBdKTtcblxuICAgIGNoaWxkMS5tdXRhdGUobXV0YXRlQ2hhbmNlKTtcbiAgICBjaGlsZDIubXV0YXRlKG11dGF0ZUNoYW5jZSk7XG5cbiAgICByZXR1cm4gWyBjaGlsZDEsIGNoaWxkMiBdO1xuICB9XG5cbiAgLy8gcmFuZG9tbHkgbXV0YXRlIGdlbmUgYnkgYSBjaGFyYWN0ZXIgZGVwZW5kaW5nIG9uIHRoZSBwZXJjZW50YWdlXG4gIG11dGF0ZShwZXJjZW50YWdlKSB7XG4gICAgaWYgKE1hdGgucmFuZG9tKCkgPiBwZXJjZW50YWdlKSB7XG5cbiAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IE1hdGgucmFuZG9tKCk7XG4gICAgICBjb25zdCBpbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMuY29kZS5sZW5ndGgpO1xuICAgICAgY29uc3QgdXBEb3duID0gTWF0aC5yYW5kb20oKSA+IDAuNSA/IDEgOiAtMTtcbiAgICAgIHN3aXRjaCh0cnVlKSB7XG4gICAgICAgIGNhc2UgKG9wZXJhdGlvbiA8IDAuMzMpOlxuICAgICAgICAgIHZhciBuZXdDb2RlID0gdGhpcy5jb2RlW2luZGV4XSArIHVwRG93bjtcbiAgICAgICAgICB2YXIgZml4ZWRDb2RlID0gbmV3Q29kZSA+IEFWQUlMQUJMRV9DSEFSQUNURVJTLmxlbmd0aCAtIDEgPyAwIDogKG5ld0NvZGUgPCAwID8gQVZBSUxBQkxFX0NIQVJBQ1RFUlMubGVuZ3RoIC0gMTogbmV3Q29kZSk7XG4gICAgICAgICAgdGhpcy5jb2RlW2luZGV4XSA9IGZpeGVkQ29kZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAob3BlcmF0aW9uIDwgMC42Nik6XG4gICAgICAgICAgdmFyIGNvcHlQb3MgPSBpbmRleCArIHVwRG93bjtcbiAgICAgICAgICB2YXIgbmV3UG9zID0gY29weVBvcyA8IDAgPyB0aGlzLmNvZGUubGVuZ3RoIC0gMSA6IChjb3B5UG9zID4gdGhpcy5jb2RlLmxlbmd0aCAtIDEgPyAwIDogY29weVBvcyk7XG4gICAgICAgICAgdGhpcy5jb2RlW2luZGV4XSA9IHRoaXMuY29kZVtuZXdQb3NdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHZhciBuZXdDb2RlID0gdGhpcy5jb2RlW2luZGV4XSArIHVwRG93bioyO1xuICAgICAgICAgIHZhciBmaXhlZENvZGUgPSBuZXdDb2RlID4gQVZBSUxBQkxFX0NIQVJBQ1RFUlMubGVuZ3RoIC0gMSA/IDAgOiAobmV3Q29kZSA8IDAgPyBBVkFJTEFCTEVfQ0hBUkFDVEVSUy5sZW5ndGggLSAxOiBuZXdDb2RlKTtcbiAgICAgICAgICB0aGlzLmNvZGVbaW5kZXhdID0gZml4ZWRDb2RlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaW50KCkge1xuICAgIHJldHVybiBodG1sRW50aXRpZXModGhpcy5jb2RlLm1hcChlbGVtZW50ID0+IEFWQUlMQUJMRV9DSEFSQUNURVJTW2VsZW1lbnRdKS5qb2luKFwiXCIpKTtcbiAgfVxufVxuXG5jbGFzcyBQb3B1bGF0aW9uIHtcbiAgLy8gc3RvcmVzIHRoZSBlbnRpcmUgZ2VuZSBwb3B1bGF0aW9uIGFuZCBmaW5kcyB0aGUgdGFyZ2V0Q2hyb21vc29tZVxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgIHRoaXMudGFyZ2V0QWNoaWV2ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmdlbmVQb29sID0gW107XG4gICAgdGhpcy5nZW5lcmF0aW9uTnVtYmVyID0gMDtcbiAgICB0aGlzLnRhcmdldENocm9tb3NvbWUgPSBudWxsO1xuICAgIHRoaXMuYmVzdEdlbmVUZW1wbGF0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiZXN0R2VuZXNDb250YWluZXInKS5pbm5lckhUTUw7XG4gIH1cblxuICBzZXRQb3BTaXplKHNpemUpIHtcbiAgICB0aGlzLmdlbmVQb29sID0gQXJyYXkuZnJvbShBcnJheShzaXplKSk7XG4gIH1cblxuICBzZXRUYXJnZXQodGFyZ2V0KSB7XG4gICAgdGhpcy50YXJnZXRDaHJvbW9zb21lID0gbmV3IEdlbmUodGFyZ2V0LnNwbGl0KCcnKS5tYXAodmFsID0+IEFWQUlMQUJMRV9DSEFSQUNURVJTLmluZGV4T2YodmFsKSkpO1xuICAgIHRoaXMuZ2VuZVBvb2wgPSB0aGlzLmdlbmVQb29sLm1hcCgoKSA9PiB7XG4gICAgICBjb25zdCBnZW5lID0gbmV3IEdlbmUoKTtcbiAgICAgIGdlbmUuZ2VuZXJhdGVDb2RlKHRhcmdldC5sZW5ndGgpO1xuICAgICAgcmV0dXJuIGdlbmU7XG4gICAgfSk7XG5cbiAgICB0aGlzLmdlbmVQb29sLm1hcChnZW5lID0+IHsgZ2VuZS5jYWxjRGlmZih0aGlzLnRhcmdldENocm9tb3NvbWUpIH0pO1xuICAgIHRoaXMuc29ydCgpO1xuICAgIHRoaXMudGFyZ2V0QWNoaWV2ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIHNvcnQoKSB7XG4gICAgdGhpcy5nZW5lUG9vbC5zb3J0KChhLCBiKSA9PiBhLmNvc3QgLSBiLmNvc3QpO1xuICB9XG5cbiAgc3RhcnQodGFyZ2V0LCBzaXplKSB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Jlc3RHZW5lc0NvbnRhaW5lcicpLmlubmVySFRNTCA9IHRoaXMuYmVzdEdlbmVUZW1wbGF0ZTtcbiAgICB0aGlzLmdlbmVyYXRpb25OdW1iZXIgPSAwO1xuICAgIHRoaXMuc2V0UG9wU2l6ZShzaXplKTtcbiAgICB0aGlzLnNldFRhcmdldCh0YXJnZXQpO1xuICAgIHRoaXMucHJpbnQoKTtcbiAgICB0aGlzLmdlbmVyYXRpb25OdW1iZXIrKztcbiAgfVxuXG4gIHBhdXNlKCkge1xuICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICB9XG5cbiAgcmVzdW1lKCkge1xuICAgIHRoaXMucnVubmluZyA9IHRydWU7XG4gICAgdGhpcy5zdGVwKCk7XG4gIH1cblxuICBzdGVwKCkge1xuICAgIHRoaXMuZ2VuZXJhdGlvbigpO1xuXG4gICAgaWYgKHRoaXMuZ2VuZVBvb2xbMF0uY29zdCA9PT0gMCkge1xuICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLnByaW50KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnJ1bm5pbmcpIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHsgdGhpcy5zdGVwKCkgfSwgMCk7XG4gIH1cblxuICBnZW5lcmF0aW9uKCkge1xuICAgIGNvbnN0IG11dGF0ZUNoYW5jZSA9IDAuMztcblxuICAgIGNvbnN0IGNoaWxkcmVuVG9NYXRlID0gTWF0aC5mbG9vcih0aGlzLmdlbmVQb29sLmxlbmd0aCAvIDIgKyAwLjUpOyAvL2hhbGYgcm91bmRlZCB1cFxuXG4gICAgY29uc3QgbmV3Q2hpbGRyZW4gPSBBcnJheS5mcm9tKEFycmF5KGNoaWxkcmVuVG9NYXRlKSkucmVkdWNlKChhLCB2LCBpKSA9PiB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuZ2VuZVBvb2xbMF0ubWF0ZSh0aGlzLmdlbmVQb29sW2krMV0sIG11dGF0ZUNoYW5jZSk7XG4gICAgICBjaGlsZHJlbi5tYXAoY2hpbGQgPT4geyBjaGlsZC5jYWxjRGlmZih0aGlzLnRhcmdldENocm9tb3NvbWUpIH0pO1xuICAgICAgcmV0dXJuIGEuY29uY2F0KGNoaWxkcmVuKTtcbiAgICB9LCBbXSk7XG5cblxuICAgIHRoaXMuZ2VuZVBvb2wgPSBuZXdDaGlsZHJlbi5zbGljZSgwLCB0aGlzLmdlbmVQb29sLmxlbmd0aCk7XG5cbiAgICB0aGlzLnNvcnQoKTtcblxuICAgIGlmICh0aGlzLmdlbmVyYXRpb25OdW1iZXIgJSBDSElMRF9QUklOVF9NT0RVTE8gPT09IDApIHRoaXMucHJpbnQoKTtcblxuICAgIHRoaXMuZ2VuZXJhdGlvbk51bWJlcisrO1xuICB9XG5cbiAgcHJpbnQoKSB7XG4gICAgdmFyIHRhYmxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RhYmxlJylcbiAgICB0YWJsZS5pbm5lckhUTUwgPSAnJztcbiAgICB0YWJsZS5pbm5lckhUTUwgKz0gKFwiPGgyPkdlbmVyYXRpb246IFwiICsgdGhpcy5nZW5lcmF0aW9uTnVtYmVyICsgXCI8L2gyPlwiKTtcbiAgICB0YWJsZS5pbm5lckhUTUwgKz0gKFwiPHVsPlwiKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2VuZVBvb2wubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRhYmxlLmlubmVySFRNTCArPSAoXCI8bGk+XCIgKyB0aGlzLmdlbmVQb29sW2ldLnByaW50KCkgKyBcIiAoXCIgKyB0aGlzLmdlbmVQb29sW2ldLmNvc3QgKyBcIilcIik7XG4gICAgfVxuICAgIHRhYmxlLmlubmVySFRNTCArPSAoXCI8L3VsPlwiKTtcblxuICAgIHZhciBiZXN0R2VuZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmVzdEdlbmVzJyk7XG4gICAgdmFyIG5ld0NoaWxkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcbiAgICBuZXdDaGlsZC5pbm5lckhUTUwgPSAnPHRkPicgKyB0aGlzLmdlbmVyYXRpb25OdW1iZXIgKyAnPC90ZD48dGQ+JyArIHRoaXMuZ2VuZVBvb2xbMF0ucHJpbnQoKSArICc8L3RkPjx0ZD4nICsgdGhpcy5nZW5lUG9vbFswXS5jb3N0ICsgJzwvdGQ+JztcbiAgICBiZXN0R2VuZXMuYXBwZW5kQ2hpbGQobmV3Q2hpbGQpO1xuICB9O1xuXG59XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XG4gIHBvcCA9IG5ldyBQb3B1bGF0aW9uKCk7XG4gIGNvbnN0IHN0YXJ0U3RyaW5nID0gJ0hlbGxvLCBXb3JsZCEnO1xuICBjb25zdCBpbml0UG9wU2l6ZSA9IDIwO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7IHBvcC5zdGFydChzdGFydFN0cmluZywgaW5pdFBvcFNpemUpOyB9KTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXVzZVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4geyBwb3AucGF1c2UoKTsgfSk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdW1lXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7IHBvcC5yZXN1bWUoKTsgfSk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RlcFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4geyBwb3Auc3RlcCgpOyB9KTtcbiAgaWYgKFJVTl9PTl9TVEFSVCkgcG9wLnN0YXJ0KHN0YXJ0U3RyaW5nLCBpbml0UG9wU2l6ZSk7XG59KTtcblxuZnVuY3Rpb24gaHRtbEVudGl0aWVzKHN0cikge1xuICByZXR1cm4gU3RyaW5nKHN0cikucmVwbGFjZSgvJi9nLCAnJmFtcDsnKS5yZXBsYWNlKC88L2csICcmbHQ7JykucmVwbGFjZSgvPi9nLCAnJmd0OycpLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKS5yZXBsYWNlKC9cXCAvZywgJyZuYnNwOycpO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vYXBwLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==
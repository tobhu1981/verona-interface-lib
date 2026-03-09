## Erprobung der Lib im Speedtest-Editor

Ersetzungen in `app.component.ts` und `unit.service.ts`. `verona-api.service.ts` kann dann entfallen!

**`app.component.ts`:**

```typescript

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { UnitService } from './services/unit.service';
import { UnitViewComponent } from './components/unit-view.component';
import { VeronaEditorApiService, StartCommandData } from '@verona/editor';

@Component({
  selector: 'speedtest-editor',
  imports: [CommonModule, ToolbarComponent, UnitViewComponent],
  template: `
    <speedtest-toolbar *ngIf="isStandalone"
                       (saveUnit)="unitService.saveUnitToFile()"
                       (unitLoaded)="unitService.loadUnitDefinition($event)">
    </speedtest-toolbar>
    <speedtest-unit-view [unit]="unitService.unit"></speedtest-unit-view>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  isStandalone = window === window.parent;

  private veronaEditor!: VeronaEditorApiService;

  constructor(public unitService: UnitService) {}

  ngOnInit(): void {
    // Retrieve the JSON-LD metadata embedded in the HTML by the build toolchain
    const metadata: string | null | undefined =
      document.getElementById('verona-metadata')?.textContent;

    this.veronaEditor = new VeronaEditorApiService({
      debug: !this.isStandalone, // useful during host-frame integration
      allowedOrigin: '*'
    });

     // UnitService Zugriff auf den Editor-Service geben,
    // damit er Änderungen selbst an den Host melden kann
    this.unitService.setEditor(this.veronaEditor);

    // Register the start-command handler BEFORE sending the ready notification
    this.veronaEditor.onStartCommand((command: StartCommandData) => {
      if (command.unitDefinition) {
        this.unitService.loadUnitDefinition(command.unitDefinition);
      }
    });

    // Announce that the editor is ready to receive commands
    this.veronaEditor.sendReady({
      metadata: metadata ? JSON.parse(metadata) : {}
    });
  }

  ngOnDestroy(): void {
    this.veronaEditor.destroy();
  }
}

```

**`unit.service.ts`:**

```typescript

import { Injectable } from '@angular/core';
//import { VariableInfo } from '@iqb/responses';
import packageInfo from 'packageInfo';
import { Unit } from 'common/interfaces/unit';
import { FileService } from 'common/services/file.service';
import * as csvParser from 'editor/src/app/services/csv-parser';
import { MessageService } from 'editor/src/app/services/message.service';
import { VeronaEditorApiService, MainSchema } from '@verona/editor';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  unitDefVersion = packageInfo.config.unit_definition_version;
  unit: Unit = {
    type: 'speedtest-unit-defintion',
    version: this.unitDefVersion,
    buttonWidth: 350,
    questions: [],
    layout: 'column',
    questionType: 'text',
    answerType: 'text'
  };

  missingCorrectAnswerIndices: number[] = [];

  private veronaEditor: VeronaEditorApiService | null = null;

  constructor(private messageService: MessageService) { }

  /**
   * Wird von der AppComponent nach der Initialisierung des VeronaEditorApiService
   * aufgerufen, damit der UnitService Änderungen an den Host melden kann.
   */
  setEditor(editor: VeronaEditorApiService): void {
    this.veronaEditor = editor;
  }

  loadUnitDefinition(unitDefinition: string): void {
    if (unitDefinition) {
      const parsedUnit = JSON.parse(unitDefinition);
      const readMajor = parsedUnit.version.split('.')[0];
      const currentMajor = this.unitDefVersion.split('.')[0];
      if (readMajor !== currentMajor) {
        this.messageService.showError('Inkompatible Unit-Version festgestellt.');
        return;
      }
      this.unit = parsedUnit;
    }
  }

  saveUnitToFile(): void {
    FileService.saveUnitToFile(UnitService.stringifyUnit(this.unit));
  }

  loadUnitFromCSV(unitString: string) {
    this.unit = {
      type: 'speedtest-unit-defintion',
      version: this.unitDefVersion,
      layout: this.unit.layout,
      questions: csvParser.parseQuestions(unitString, this.unit.questionType, this.unit.multipleSelection),
      questionType: this.unit.questionType,
      answerType: this.unit.answerType,
      multipleSelection: this.unit.multipleSelection
    };
    this.updateUnitDef();
  }

  updateUnitDef(): void {
    this.veronaEditor?.sendDefinitionChanged(
      UnitService.stringifyUnit(this.unit),
      'speedtest-unit-definition@1.0.0',
      UnitService.getVariableInfo()
    );
  }

  private static stringifyUnit(unit: Unit): string {
    return JSON.stringify(unit, (key, value) => {
      if (unit.answerType === 'number' && key === 'answers') {
        return undefined;
      }
      return value;
    });
  }

// 'valuePositionLabels' is optional in 'MainSchema.VariableInfo', 
// so it can simply be omitted instead of passing an empty array 
// that does not match the expected type anyway.
  static getVariableInfo(useMultiSelect: boolean = false): MainSchema.VariableInfo[] {
    return [
      {
        id: 'value',
        alias: 'value',
        type: 'integer',
        format: '',
        multiple: useMultiSelect,
        nullable: false,
        values: [],
        valuesComplete: true
      },
      {
        id: 'time',
        alias: 'time',
        type: 'integer',
        format: '',
        multiple: false,
        nullable: false,
        values: [],
        valuesComplete: true
      },
      {
        id: 'activeQuestionIndex',
        alias: 'activeQuestionIndex',
        type: 'no-value',
        format: '',
        multiple: false,
        nullable: false,
        values: [],
        valuesComplete: true
      },
      {
        id: 'total_correct',
        alias: 'total_correct',
        type: 'integer',
        format: '',
        multiple: false,
        nullable: false,
        values: [],
        valuesComplete: true
      },
      {
        id: 'total_wrong',
        alias: 'total_wrong',
        type: 'integer',
        format: '',
        multiple: false,
        nullable: false,
        values: [],
        valuesComplete: true
      }
    ];
  }

  addAnswer(questionIndex: number, answerText: string) {
    this.unit.questions[questionIndex].answers.push({ text: answerText });
    this.updateUnitDef();
  }

  deleteAnswer(questionIndex: number, answerIndex: number) {
    this.unit.questions[questionIndex].answers.splice(answerIndex, 1);
    this.updateUnitDef();
    this.calculateMissingCorrectAnswerIndeces();
  }

  calculateMissingCorrectAnswerIndeces(): void {
    this.missingCorrectAnswerIndices = this.unit.questions
      .map((question, index) => {
        return question.correctAnswer === undefined ||
               (Array.isArray(question.correctAnswer) && question.correctAnswer.length === 0) ?
          index : -1;
      })
      .filter(index => index !== -1)
      .map(index => index + 1);
    if (this.missingCorrectAnswerIndices.length > 0) {
      this.messageService.showPermanently(
        `Es fehlen Lösungen für mindestens folgende Fragen:
                    ${this.missingCorrectAnswerIndices.slice(0, 9).join(', ')}`
      );
    } else {
      this.messageService.hideMessage();
    }
  }
}
```

## Ergebnisse der Erprobung

Editor hat gleiche Funktionalität im Studio wie zuvor. Die Aufgabenvorschau arbeitet auch wie gewohnt.
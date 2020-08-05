import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartDataSets, ChartOptions, Chart } from 'chart.js';
import { Color } from 'ng2-charts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  @ViewChild('canvas') canvas: ElementRef;

  itemsPerPage: number;
  totalItems: any;
  previousPage: any;
  public pageNum = 0;
  public pageSize = 20;
  public collectionSize = 20;
  public hackerList: any[];

  public lineChartLabels = [];
  voteCounts: any = [];
  public Linechart;  

  constructor(private httpClient: HttpClient,
    private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.loadData(this.pageNum);
  }

  loadData(page) {
    const url = `https://hn.algolia.com/api/v1/search?tags=front_page&page=${page}`;
    this.httpClient.get(url).subscribe((data: any) => {
      this.hackerList = data && data.hits;
      localStorage.setItem('hackNewsList', JSON.stringify(this.hackerList));
      this.getMapData();
    });
  }

  hideRow(rowIndex){
    this.hackerList.splice(rowIndex,1);
    localStorage.setItem('hackNewsList', JSON.stringify(this.hackerList));
    this.getMapData();
  }

  loadPage(page: number) {
    this.lineChartLabels = [];
    this.voteCounts = [];
    if (page !== this.previousPage) {
      this.previousPage = page;
      this.loadData(this.previousPage-1);
    }
  }

  getMapData(){
    this.lineChartLabels = [];
    this.voteCounts = [];
    this.hackerList.forEach(item => {
      this.lineChartLabels.push(item.objectID)
      this.voteCounts.push(item.points)
    });
    let htmlRef = this.elementRef.nativeElement.querySelector(`#canvas`);
    this.Linechart = new Chart(htmlRef, {
      type: 'line',  
      data: {  
        labels: this.lineChartLabels,  
        datasets: [  
          {  
            data: this.voteCounts,  
            borderColor: '#3cb371'
          }  
        ]  
      },  
      options: {
        responsive: true,  
        legend: {  
          display: false  
        },  
        scales: {
          xAxes: [{  
            display: true,
            scaleLabel: {
              labelString : 'ID'
            } 
          }
        ],  
          yAxes: [{  
            display: true,
            scaleLabel: {
              labelString : 'Votes'
            }   
          }],  
        }  
      }  
    });

  }

  upVote(selectedRow){
    this.hackerList[selectedRow].points = this.hackerList[selectedRow].points + 1;
    localStorage.setItem('hackNewsList', JSON.stringify(this.hackerList));
    this.getMapData();
  }
}

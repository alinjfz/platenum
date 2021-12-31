import React, { Component } from "react";
import { Grid } from "semantic-ui-react";
import PlateArticle from "./PlateArticle";
import { platedata, provinceData, letterOptions } from "./data.json";
export default class PlateNumber extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedLetter: "A",
      numright: "",
    };
    this.provinceData = provinceData;
    this.letterOptions = letterOptions;
    this.data = platedata;
    /*  
     {
        province: "",
        numbers: ["nmbr"],
        county: [
          {
            countyName: "CNAME",
            sub: [""],
            letternum: [
              {
                letter: "lter",
                num: "adadesh",
              },
            ],
          },
        ],
      },
     */
  }
  onSelectHandler = (e) => {
    const val = e.target.value;
    if (this.state.selectedLetter !== val) {
      this.setState({ selectedLetter: val });
    }
  };
  makeLetters = () => {
    /**
     ب، ج، د، ژ (معلولین)، س، ص، ط، ق، ل، م، ن، و، هـ، ی
     */
    return (
      <select
        className={`${
          this.state.selectedLetter === ""
            ? "isEmpty"
            : "is-" + this.state.selectedLetter
        }`}
        defaultValue={"S"}
        onChange={this.onSelectHandler}
      >
        {this.letterOptions.map((el) => (
          <option key={el.key} value={el.value}>
            {el.text}
          </option>
        ))}
      </select>
    );
  };
  findProvincesThatMatchNumber = (data, num) => {
    // find provinces that match the number
    const provinces = [];
    if (data && typeof data.forEach === "function") {
      data.forEach((proelement) => {
        if (
          proelement &&
          proelement.numbers &&
          proelement.numbers.findIndex((el) => el === num) !== -1
        )
          provinces.push(proelement);
      });
    }
    return provinces;
  };
  findInCountyLetters = (county, letter, num) => {
    const result = [];
    if (county && typeof county.forEach === "function") {
      county.forEach((el) => {
        if (el && el.num && el.num === num && el.letter) {
          if (
            el.letter === "all" ||
            el.letter === letter ||
            (Array.isArray(el.letter) &&
              el.letter.findIndex((tt) => tt === letter) !== -1)
          )
            result.push(el);
        }
      });
    }

    return result;
  };
  findInCounty = (county, letter, num) => {
    const result = [];
    let temp = false;
    if (county && typeof county.forEach === "function") {
      county.forEach((coun) => {
        if (
          coun &&
          coun.countyName &&
          coun.letternum &&
          coun.letternum.length > 0
        ) {
          temp = this.findInCountyLetters(coun.letternum, letter, num);
          if (temp && temp.length > 0) {
            result.push(coun);
          }
        }
      });
    }
    return result;
  };
  searchForRes = () => {
    const theletter = this.state.selectedLetter;
    const thenumber = this.state.numright;
    if (!thenumber || !theletter) return [];
    let result = [];
    let tempCounty = [];
    let temp = false;
    const provinces = this.findProvincesThatMatchNumber(this.data, thenumber);
    // iterate provinces
    if (provinces && typeof provinces.forEach === "function") {
      provinces.forEach((prov) => {
        if (prov && prov.province && prov.county && prov.county.length > 0) {
          tempCounty = prov.county;
          // iterate county
          temp = this.findInCounty(tempCounty, theletter, thenumber);
          if (temp && temp.length > 0) {
            result.push({ province: prov, county: temp });
          }
        }
      });
    }
    return result;
  };
  makeResultComponent = (temp) => {
    if (
      temp &&
      temp.province &&
      temp.province.province &&
      temp.county &&
      temp.county.length > 0 &&
      typeof temp.county.forEach === "function"
    ) {
      const ptxt = temp.province.province;
      let ctxt = "";
      let flag = false;
      temp.county.forEach((ct) => {
        if (ct) {
          ctxt += `${flag ? "، " : " "}${ct.countyName}`;
          flag = true;
        }
      });
      return (
        <>
          <h3>{`استان ${ptxt} - شهرستان ${ctxt}`}</h3>
        </>
      );
    }
    return null;
  };
  makeResult = () => {
    let comp = <></>;
    const result = this.searchForRes();
    if (result && result.length > 0 && typeof result.forEach === "function") {
      result.forEach((temp) => {
        comp = <>{this.makeResultComponent(temp)}</>;
      });
    } else {
      const data = this.provinceData;
      const i = this.state.numright;
      if (i && i.length === 2) {
        const temp = data.find((el) => el.number === i);
        if (temp && temp.province)
          comp = (
            <>
              {comp}
              <h3>{`استان ${temp.province}`}</h3>
            </>
          );
      }
    }
    return comp;
  };
  render() {
    return (
      <Grid className="plate-number">
        <Grid.Row>
          <div className="pn-plate">
            <div className="numleft">{this.makeLetters()}</div>
            <div className="numright">
              {/* <datalist id="plate-right-number">
                {this.provinceData.map((el) => (
                  <option value={el.number} key={el.number + el.province}>
                    {el.number}
                  </option>
                ))}
              </datalist> */}
              <input
                className="plate-right-number"
                autoFocus
                type="text"
                // pattern="[0-9]*"
                inputMode="numeric"
                onFocus={(e) => {
                  this.setState({ numright: "" });
                  // window.setSelectionRange(0, this.state.numright.length);
                }}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v.length >= 0 && v.length <= 2)
                    this.setState({ numright: v });
                }}
                placeholder="11"
                value={this.state.numright}
              />
            </div>
          </div>
        </Grid.Row>
        <Grid.Row centered className="plate-result-row">
          <Grid.Column computer={10} tablet={12} mobile={16}>
            {this.makeResult()}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row centered className="plate-article-row">
          <Grid.Column computer={10} tablet={12} mobile={16}>
            <PlateArticle
              number={this.state.numright}
              letter={this.state.selectedLetter}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

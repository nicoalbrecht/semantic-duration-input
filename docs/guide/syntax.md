---
description: What the parser accepts. Units, compound values, implicit units, decimals, clock format, ISO 8601, typo suggestions and error codes.
---

# Syntax

Case and extra whitespace are ignored everywhere.

<Demo placeholder="Try 2d4h, 1,5 Std, 1:30 or 2 huors" validate-on="input" />

## Units

Seconds (only with `precision="second"`), minutes, hours, days and weeks. Months and years are left out because their length varies. `m` always means minutes.

| Unit | English | German |
| --- | --- | --- |
| second | `s` `sec` `secs` `second` `seconds` | `s` `sek` `sekunde` `sekunden` |
| minute | `m` `min` `mins` `minute` `minutes` | `m` `min` `minute` `minuten` |
| hour | `h` `hr` `hrs` `hour` `hours` | `h` `std` `stunde` `stunden` |
| day | `d` `day` `days` | `d` `t` `tag` `tage` `tagen` |
| week | `w` `wk` `wks` `week` `weeks` | `w` `wo` `woche` `wochen` |

The other built-in locales are accepted when you pass them in the `locales` prop, e.g. `:locales="[fr, en]"`. Each of them also accepts `h`, `m`, `min`, `s`, `d` and `w`.

| Unit | Spanish (`es`) | French (`fr`) | Portuguese (`pt`) |
| --- | --- | --- | --- |
| second | `seg` `segs` `segundo` `segundos` | `sec` `secs` `seconde` `secondes` | `seg` `segs` `segundo` `segundos` |
| minute | `mins` `minuto` `minutos` | `mn` `mins` `minute` `minutes` | `mins` `minuto` `minutos` |
| hour | `hr` `hrs` `hora` `horas` | `heure` `heures` | `hr` `hrs` `hora` `horas` |
| day | `día` `días` `dia` `dias` | `j` `jour` `jours` | `dia` `dias` |
| week | `sem` `semana` `semanas` | `sem` `semaine` `semaines` | `sem` `semana` `semanas` |

| Unit | Hindi (`hi`) | Arabic (`ar`) | Chinese (`zh`) |
| --- | --- | --- | --- |
| second | `से` `सेकंड` `सेकेंड` `सेकण्ड` | `ث` `ثانية` `ثانيتان` `ثوان` `ثواني` | `秒` `秒钟` |
| minute | `मि` `मिनट` `मिनिट` | `د` `دقيقة` `دقيقتان` `دقائق` | `分` `分钟` `分鐘` |
| hour | `घं` `घंटा` `घंटे` `घण्टा` `घण्टे` | `س` `ساعة` `ساعتان` `ساعات` | `时` `小时` `个小时` `钟头` `小時` `個小時` `鐘頭` |
| day | `दि` `दिन` | `ي` `يوم` `يومان` `أيام` `يومًا` | `天` `日` |
| week | `सप्ताह` `हफ़्ता` `हफ़्ते` | `أ` `أسبوع` `أسبوعان` `أسابيع` `أسبوعًا` | `周` `星期` `个星期` `礼拜` `週` `禮拜` |

Arabic also accepts the forms after `ين` (`ساعتين`), and spellings without hamza or with `ه` for `ة` (`اسبوع`, `ساعه`).

Which names are accepted depends on the `locales` prop (English and German by default). To add a language or more names, see [Locales](./locales).

With the default minute precision, seconds are not a unit, so `30s` is an `unknown_unit` error.

## Compound values

`1d 2h 30min`, `2d4h`, `1 hour, 30 minutes`. Parts can be separated by spaces, `,`, `+` or `&`, and by the separator words of the active locales (`and`, `und`, `y`, `et`, `e`, `और`, `و`, `和`). Unit names may end with a period, as in `2 Std. 30 Min.`

Chinese is written without spaces, so its separators (`和`, `又`, `零`) may be attached to the unit before them: `1小时零5分钟`. Chinese and Japanese separators in custom locales work the same way.

## Implicit units

A single trailing number takes the next smaller unit: `1h30` is 1h 30min and `1d 4` is 1d 4h.

- Only one trailing number is allowed: `1h 30 15` is a `missing_unit` error.
- The "next smaller unit" depends on the precision. `1m 30` is 1m 30s with `precision="second"`, and a `missing_unit` error otherwise.
- [Custom units](./units#implicit-units) never take the trailing number: it goes to the next smaller built-in unit.
- Turn it off with `:implicit-units="false"`.

## Decimals

`1.5h` or `1,5h`. Results are rounded to whole minutes, or to whole seconds with `precision="second"`.

## Digits

Besides `0`–`9`, Arabic-Indic (`٣٠`), Persian (`۳۰`), Devanagari (`३०`) and full-width digits (`３０`) are accepted, in every locale. So are the Arabic decimal separator `٫`, the commas `،` `、` `，`, and the full-width `：` and `＋`: `١٫٥ ساعة`, `１小时，３０分钟`, `１：３０`. Error tokens show the input as typed.

## Clock format

`h:mm`, e.g. `1:30` or `26:05`. With `precision="second"`, `h:mm:ss` works too. Minutes and seconds need two digits between `00` and `59`, so `1:5` is invalid.

## ISO 8601

`PT1H30M`, `P1DT2H` or `P2W`, e.g. pasted from an API. Lowercase, decimals (`PT1,5H`) and weeks together with days (`P1W2D`) are accepted. Years and months (`P1Y`, `P1M`) are not.

Seconds are accepted in ISO input even at minute precision, and they get rounded: `PT30S` becomes 1 minute.

## Bare numbers

A number without a unit (`45`) is rejected with `missing_unit`, because it's ambiguous. Set `default-unit="minute"` to accept it:

<Demo default-unit="minute" placeholder="45" />

## Typos

Unknown units get a suggestion from the unit names of the active locales and precision: `2 huors` gives *Unknown unit "huors". Did you mean "hours"?* Words shorter than 5 characters may be one edit away from a unit name, longer ones two. Names shorter than 3 characters (`h`, `d`, ...) are never suggested.

## Errors

| Code | When |
| --- | --- |
| `empty` | Nothing entered, with `required` |
| `invalid_format` | Not a duration at all (`hello`, `1:5`, `P1Y`), a stray word (`2h foo`), or longer than 256 characters |
| `unknown_unit` | A number followed by an unknown word (`5 parsecs`) |
| `missing_unit` | A number without a unit (`45`, `1h 30 15`) |
| `out_of_range` | Below `min` or above `max` |

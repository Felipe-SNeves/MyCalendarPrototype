import { StyleSheet, Text, View, Button } from 'react-native';
import { useState } from 'react';
import axios from 'axios';
import { LocaleConfig, Calendar } from 'react-native-calendars';

LocaleConfig.locales['pt'] = {
  monthNames: [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
  ],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: "Hoje"
};

LocaleConfig.defaultLocale = 'pt';

let markedDates = {};
const colors = [
  '#00AA00',
  '#FF8C00',
  '#AA0000'
]

function Placeholder (props) {
  return (
      <Text style={styles.caption}>
        <View style={{
        height: 30,
        width: 30,
        borderRadius: 30,
        backgroundColor: props.color
      }} />
        <Text>{props.description}</Text>
      </Text>
  );
}

export default function App() {

  const [updateScreen, setUpdateScreen] = useState (false);
  const [smartCalendar, setSmartCalendar] = useState (false);

  let calendar = (!smartCalendar) ? (
    <Calendar
        style={styles.calendar}
        onDayPress={day => {
          if (!markedDates[day.dateString])
            markedDates[day.dateString] = { selected: true, selectedColor: colors[0], actualColor: 0 }
          else {
            markedDates[day.dateString].selected = true;
            let nextColor = calculateNextColor (markedDates[day.dateString].actualColor);
            markedDates[day.dateString].selectedColor = colors[nextColor];
            markedDates[day.dateString].actualColor = nextColor;
            if (nextColor == 3)
              markedDates[day.dateString].selected = false;
          }
          setUpdateScreen (!updateScreen);
        }}
        monthFormat={"MMM yyyy"}
        disableMonthChange={true}
        markedDates={markedDates}
      />
  ) : (<>
    <Text style={styles.bold}>Smart Calendar Version</Text>
    <Calendar
        style={styles.calendar}
        monthFormat={"MMM yyyy"}
        disableMonthChange={true}
        markedDates={markedDates}
      />
    </>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendário para o meu lindo titio Arnaldo</Text>
      {
        calendar
      }
      <Button title="Smart Calendar" onPress={ () => { getEvents (smartCalendar) && setSmartCalendar (!smartCalendar) }} />
      <Placeholder color={colors[0]} description="Disponível" />
      <Placeholder color={colors[1]} description="Reservado" />
      <Placeholder color={colors[2]} description="Indisponível" />
    </View>
  );
}

let getEvents = async (smartCalendar) => {

  if (smartCalendar) {
    markedDates = {};
    await axios.get ("http://192.168.0.15:8080/getCalendar/").then ((res) => {
      res["data"].response.forEach ((event) => {
        markedDates[event.start.date] = { selected: true, selectedColor: (event.summary == "Livre") ? colors[0] : ((event.summary == "Ocupado") ? colors[2] : colors[1])}
      })
      return true;
    }).catch ((err) => {
      console.error (JSON.stringify (err));
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingHorizontal: '5%',
    marginVertical: '25%'
  },
  title: {
    fontSize: 16,
  },
  calendar: {
    marginVertical: '10%'
  },
  bold: {
    fontWeight: "bold"
  },
  caption: {
    marginTop: "5%"
  }
});

function calculateNextColor (actualColor) {
  return (actualColor + 1) % 4;
}